const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const {
  compilationRoutes,
  selectCompilationRoutes,
  retainCompiledPagesInMirror,
  prepareCompilation,
} = require('./compilation-readiness.cjs');

const seed = {
  companyId: '00000000-0000-0000-0000-000000000001',
  workspaceId: '00000000-0000-0000-0000-000000000002',
  riskGroupId: '00000000-0000-0000-0000-000000000003',
};
const baseURL = 'http://localhost:43210';

test('covers the seventeen real page families, including cold chemical and version editor bundles', () => {
  const routes = compilationRoutes(seed);
  assert.equal(routes.length, 17);
  assert(routes.some(r => r.page === '/dashboard/esocial'));
  assert.equal(new Set(routes.map((r) => r.page)).size, routes.length);
  assert(routes.some((r) => r.page.endsWith('/produtos-quimicos')));
  assert(
    routes.some((r) => r.page.includes('/[matrixId]/versoes/[versionId]')),
  );
  assert(routes.every((r) => !r.path.includes('[') && r.path.startsWith('/')));
  assert.throws(() => compilationRoutes({}), /seed companyId/);
});

test('retains bundles only in the disposable mirror and preserves the source configuration', () => {
  const root = mkdtempSync(join(tmpdir(), 'sst-compilation-'));
  try {
    const source = join(root, 'source');
    const mirror = join(root, 'mirror');
    mkdirSync(source);
    mkdirSync(mirror);
    const original =
      'module.exports = { webpack(config) { config.originalLoader = true; return config; }, onDemandEntries: { maxInactiveAge: 60000, pagesBufferLength: 5 } };';
    writeFileSync(join(source, 'next.config.js'), original);
    writeFileSync(join(mirror, 'next.config.js'), original);
    assert.throws(
      () => retainCompiledPagesInMirror(source, source, 16),
      /disposable Next mirror/,
    );
    retainCompiledPagesInMirror(mirror, source, 16);
    assert.equal(
      readFileSync(join(source, 'next.config.js'), 'utf8'),
      original,
    );
    const config = require(join(mirror, 'next.config.js'));
    assert.equal(config.onDemandEntries.maxInactiveAge, 3600000);
    assert.equal(config.onDemandEntries.pagesBufferLength, 18);
    const webpack = config.webpack({ cache: { type: 'filesystem' } }, {});
    assert.equal(webpack.originalLoader, true);
    assert.equal(webpack.cache, false);
    assert.equal(require(join(source, 'next.config.js')).webpack({ cache: true }, {}).cache, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('reads every real document and complete JavaScript bundle, without cookies or following redirects', async () => {
  const calls = [];
  const snapshots = [];
  const routes = compilationRoutes(seed).slice(0, 3);
  const report = await prepareCompilation({
    baseURL,
    routes,
    onProgress: (r) => snapshots.push(JSON.parse(JSON.stringify(r))),
    fetchImpl: async (url, options) => {
      calls.push({ url: url.href, options });
      assert.equal(url.origin, baseURL);
      assert.equal(options.redirect, 'manual');
      assert.equal(options.headers.Cookie, undefined);
      assert(options.signal instanceof AbortSignal);
      if (url.pathname.endsWith('.js'))
        return new Response('window.__NEXT_P = [];', {
          headers: { 'content-type': 'application/javascript' },
        });
      return url.pathname === '/login'
        ? new Response('<html>login</html>')
        : new Response('', {
            status: 307,
            headers: { location: '/login?redirect=test' },
          });
    },
  });
  assert.equal(calls.length, routes.length * 2);
  assert.equal(report.state, 'READY');
  assert(report.routes.every((r) => r.state === 'READY' && r.bundleBytes > 0));
  assert.equal(snapshots.at(-1).state, 'READY');
});

test('fails setup clearly on a failed bundle, without retrying or reaching later pages', async () => {
  let calls = 0;
  let final;
  await assert.rejects(
    prepareCompilation({
      baseURL,
      routes: compilationRoutes(seed),
      onProgress: (r) => {
        final = r;
      },
      fetchImpl: async (url) => {
        calls++;
        return url.pathname.endsWith('.js')
          ? new Response('compile failed', { status: 500 })
          : new Response('<html>login</html>');
      },
    }),
    /Next compilation readiness failed for \/login: Page bundle is not ready/,
  );
  assert.equal(calls, 2);
  assert.equal(final.state, 'FAILED');
  assert.equal(final.routes.length, 1);
  assert.equal(final.routes[0].state, 'FAILED');
});

test('rejects HTML masquerading as a successful bundle and nonlocal setup targets', async () => {
  await assert.rejects(
    prepareCompilation({
      baseURL,
      routes: [{ page: '/login', path: '/login' }],
      fetchImpl: async () =>
        new Response('<html>error</html>', {
          headers: { 'content-type': 'text/html' },
        }),
    }),
    /did not return JavaScript/,
  );
  await assert.rejects(
    prepareCompilation({ baseURL: 'https://example.com', routes: [] }),
    /local Next/,
  );
});

test('uses a separate setup deadline and reports the page when the deadline is exhausted', async () => {
  let clock = 0;
  let calls = 0;
  await assert.rejects(
    prepareCompilation({
      baseURL,
      routes: [{ page: '/login', path: '/login' }],
      now: () => clock,
      totalTimeoutMs: 10,
      fetchImpl: async () => {
        calls++;
        clock += 11;
        return new Response('<html>login</html>');
      },
    }),
    /\/login: Total compilation setup deadline exceeded/,
  );
  assert.equal(calls, 1);
});

test('focused warm-up validates real page identities and does not modify the full route inventory', () => {
 const routes=compilationRoutes(seed);const original=JSON.stringify(routes);
 assert.equal(selectCompilationRoutes(routes,undefined),routes);
 const focused=selectCompilationRoutes(routes,JSON.stringify(['/login','/dashboard/empresas/[companyId]/esocial']));
 assert.equal(focused.length,2);assert.equal(JSON.stringify(routes),original);
 for(const pages of [[],['/dashboard'],['/login','/invented'],['/login','/login']])assert.throws(()=>selectCompilationRoutes(routes,JSON.stringify(pages)));
});
