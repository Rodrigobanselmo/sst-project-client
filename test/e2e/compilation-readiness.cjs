const assert = require('node:assert/strict');
const { appendFileSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

// These are page families, not business records. Guest requests stop at the
// existing SSR auth guard, before any record lookup. All placeholder UUIDs come
// from the disposable seed; preparing a page does not create data or a session.
function compilationRoutes(seed) {
  for (const key of ['companyId', 'workspaceId', 'riskGroupId'])
    assert.match(seed[key] || '', /^[0-9a-f-]{36}$/i, `Missing seed ${key}`);
  const company = `/dashboard/empresas/${seed.companyId}`;
  const pattern = '/dashboard/empresas/[companyId]';
  const route = (page, path = page) => ({ page, path });
  return [
    route('/login'),
    route('/dashboard'),
    route('/dashboard/esocial'),
    route(`${pattern}/empregados`, `${company}/empregados`),
    route(`${pattern}/fatores-riscos`, `${company}/fatores-riscos`),
    route(
      `${pattern}/fatores-riscos/[riskId]/edit`,
      `${company}/fatores-riscos/${seed.riskGroupId}/edit`,
    ),
    route(
      `${pattern}/hierarquia`,
      `${company}/hierarquia?tabWorkspaceId=${seed.workspaceId}`,
    ),
    route(
      `${pattern}/novo/[stage]`,
      `${company}/novo/sst?active=2&tabWorkspaceId=${seed.workspaceId}`,
    ),
    route(`${pattern}/esocial`, `${company}/esocial`),
    route(`${pattern}/esocial/certificados`, `${company}/esocial/certificados`),
    route('/dashboard/configuracoes/certificado-transmissao-esocial'),
    route('/dashboard/configuracoes/certificados-esocial'),
    route(
      `${pattern}/[workspaceId]/caracterizacao-editar/[characterizationId]`,
      `${company}/${seed.workspaceId}/caracterizacao-editar/${seed.riskGroupId}`,
    ),
    route(`${pattern}/matrizes-risco`, `${company}/matrizes-risco`),
    route(
      `${pattern}/matrizes-risco/[matrixId]/versoes/[versionId]`,
      `${company}/matrizes-risco/${seed.riskGroupId}/versoes/${seed.riskGroupId}`,
    ),
    route(
      `${pattern}/produtos-quimicos`,
      `${company}/produtos-quimicos?tabWorkspaceId=${seed.workspaceId}`,
    ),
    route('/dashboard/dados/matriz-padrao-simplesst'),
  ];
}

// Optional warm-up scope for a focused run. It never filters tests, changes
// their assertions or mocks a page; an unwarmed page compiles normally on use.
function selectCompilationRoutes(routes, serialized) {
  if (!serialized) return routes;
  const pages = JSON.parse(serialized);
  assert(Array.isArray(pages) && pages.length > 0 && pages.includes('/login'), 'Preparation scope must include login');
  assert(pages.every(page => typeof page === 'string' && routes.some(route => route.page === page)), 'Unknown preparation page');
  assert.equal(new Set(pages).size, pages.length, 'Duplicate preparation page');
  return routes.filter(route => pages.includes(route.page));
}

function retainCompiledPagesInMirror(mirror, sourceRoot, routeCount) {
  assert.notEqual(
    resolve(mirror),
    resolve(sourceRoot),
    'Only the disposable Next mirror may change',
  );
  assert(Number.isInteger(routeCount) && routeCount > 0);
  const configPath = resolve(mirror, 'next.config.js');
  const marker = '// Disposable browser harness: retain prepared page bundles.';
  assert(
    !readFileSync(configPath, 'utf8').includes(marker),
    'Compilation retention already configured',
  );
  // The application's 60-second/5-page development eviction would otherwise
  // discard the first prepared pages before a full suite reaches them. This
  // appended override exists only in the mirror which cleanup deletes.
  appendFileSync(
    configPath,
    `\n${marker}\nmodule.exports.onDemandEntries = { ...module.exports.onDemandEntries, maxInactiveAge: 60 * 60 * 1000, pagesBufferLength: ${routeCount + 2} };\n// The mirror is discarded after each run; do not write gigabytes of reusable webpack cache.\nconst browserOriginalWebpack = module.exports.webpack;\nmodule.exports.webpack = function(config, context) { const result = browserOriginalWebpack ? browserOriginalWebpack.call(this, config, context) : config; result.cache = false; return result; };\n`,
  );
}

async function prepareCompilation({
  baseURL,
  routes,
  fetchImpl = fetch,
  now = Date.now,
  totalTimeoutMs = 300000,
  requestTimeoutMs = 90000,
  onProgress = () => {},
}) {
  const origin = new URL(baseURL);
  assert(
    ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname),
    'Compilation preparation must stay on local Next',
  );
  const started = now();
  const report = {
    state: 'PREPARING',
    startedAt: new Date(started).toISOString(),
    routes: [],
  };
  const publish = () => onProgress(report);
  publish();
  try {
    for (const route of routes) {
      assert(route.path.startsWith('/') && !route.path.startsWith('//'));
      assert(route.page.startsWith('/') && !route.page.startsWith('//'));
      const bundlePath = `/_next/static/chunks/pages${route.page}.js`;
      const row = {
        page: route.page,
        path: route.path,
        bundlePath,
        state: 'PREPARING',
      };
      report.routes.push(row);
      publish();
      const routeStarted = now();
      const request = async (path) => {
        const remaining = totalTimeoutMs - (now() - started);
        if (remaining <= 0)
          throw new Error('Total compilation setup deadline exceeded');
        const response = await fetchImpl(new URL(path, origin), {
          redirect: 'manual',
          signal: AbortSignal.timeout(Math.min(requestTimeoutMs, remaining)),
          headers: {
            Accept:
              path === route.path ? 'text/html' : 'application/javascript',
          },
        });
        // Consume the body too: response headers alone do not prove a complete
        // bundle has been emitted. The same signal bounds the body read.
        const body = await response.text();
        return { response, body };
      };
      try {
        const document = await request(route.path);
        row.documentStatus = document.response.status;
        if (route.page === '/login') {
          assert.equal(
            document.response.status,
            200,
            'Login document is not ready',
          );
        } else {
          assert(
            [307, 308].includes(document.response.status),
            'Protected page did not return the guest auth redirect',
          );
          const location = new URL(
            document.response.headers.get('location') || '',
            origin,
          );
          assert(
            location.origin === origin.origin && location.pathname === '/login',
            'Protected page redirected outside the local login',
          );
        }
        const bundle = await request(bundlePath);
        row.bundleStatus = bundle.response.status;
        assert.equal(bundle.response.status, 200, 'Page bundle is not ready');
        assert.match(
          bundle.response.headers.get('content-type') || '',
          /(?:javascript|ecmascript)/i,
          'Page bundle did not return JavaScript',
        );
        assert(bundle.body.trim().length > 0, 'Page bundle is empty');
        row.bundleBytes = Buffer.byteLength(bundle.body);
        row.durationMs = now() - routeStarted;
        row.state = 'READY';
        publish();
      } catch (cause) {
        row.state = 'FAILED';
        row.error = cause.message;
        throw new Error(
          `Next compilation readiness failed for ${route.page}: ${cause.message}`,
          { cause },
        );
      }
    }
    report.state = 'READY';
    report.durationMs = now() - started;
    publish();
    return report;
  } catch (error) {
    report.state = 'FAILED';
    report.error = error.message;
    report.durationMs = now() - started;
    publish();
    throw error;
  }
}

module.exports = {
  compilationRoutes,
  selectCompilationRoutes,
  retainCompiledPagesInMirror,
  prepareCompilation,
};
