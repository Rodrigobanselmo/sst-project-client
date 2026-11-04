// Isolated browser harness: real hooks/components, only HTTP/service boundaries
// replaced. Never opens production, and rejects any external network request.
const path = require('node:path'),
  fs = require('node:fs'),
  http = require('node:http'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const esbuild = require(
  require.resolve('esbuild', {
    paths: [
      root,
      path.resolve(root, '../sst-project-api-planlink-counts'),
      path.resolve(root, '../sst-project-api'),
    ],
  }),
);
const { chromium } = require(path.join(root, 'node_modules/@playwright/test'));
const stub = path.join(__dirname, 'stubs.tsx');
const sourceRoot = process.env.PGR_TEST_SOURCE_ROOT;
const plugins = [
  {
    name: 'candidate-or-baseline',
    setup(build) {
      if (sourceRoot)
        build.onResolve({ filter: /^\./ }, (args) => {
          const resolved = path.resolve(args.resolveDir, args.path);
          if (resolved.startsWith(path.join(root, 'src') + path.sep)) {
            const target = path.join(sourceRoot, path.relative(root, resolved));
            return {
              path: fs.existsSync(target)
                ? target
                : fs.existsSync(target + '.ts')
                  ? target + '.ts'
                  : target + '.tsx',
            };
          }
        });
    },
  },
  {
    name: 'fixture-boundaries',
    setup(build) {
      build.onResolve(
        {
          filter:
            /^(core\/services\/|notistack$|@v2\/components\/organisms\/SModal\/hooks\/useConfirmationModal$|@v2\/services\/forms\/form-application\/|@v2\/components\/forms\/fields\/SAutocompleteSelect\/|components\/atoms\/SButton$|components\/atoms\/SText$)/,
        },
        (args) => {
          if (/queryClient/.test(args.path)) return;
          return { path: stub };
        },
      );
    },
  },
];
(async () => {
  const bundle = await esbuild.build({
    entryPoints: [path.join(__dirname, 'harness.tsx')],
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'iife',
    plugins,
    tsconfig: path.join(root, 'tsconfig.json'),
    nodePaths: [path.join(root, 'node_modules')],
    define: { 'process.env.NODE_ENV': '"test"' },
  });
  let cases = 0;
  const server = http.createServer((req, res) => {
    res.setHeader(
      'content-type',
      req.url === '/bundle.js' ? 'application/javascript' : 'text/html',
    );
    res.end(
      req.url === '/bundle.js'
        ? bundle.outputFiles[0].text
        : '<div id="root"></div><script src="/bundle.js"></script>',
    );
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.PGR_TEST_BROWSER ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  async function scenario(name, options, run) {
    const page = await browser.newPage();
    const errors = [],
      creates = [],
      requests = [];
    page.on('pageerror', (e) => errors.push(e.message));
    let release;
    const pending = new Promise((r) => (release = r));
    let versionCalls = 0;
    let appMode = options.apps || 'ready',
      riskMode = options.risks || 'ready',
      versionMode = options.versions || 'ready';
    await page.route('**/*', async (route) => {
      const u = new URL(route.request().url());
      assert.equal(u.origin, origin, 'External network prohibited');
      const p = u.pathname;
      if (p === '/' || p === '/bundle.js') return route.continue();
      requests.push(p);
      let status = 200,
        body = {};
      if (p === '/applications' || p.endsWith('/forms/applications/')) {
        if (appMode === 'slow') await pending;
        if (appMode === 'error') status = 503;
        body = { results: u.searchParams.has('applicationId') ? [{ id: 'application-linked', name: 'Aplicação preservada', form: { type: 'PSYCHOSOCIAL' } }] : [] };
      } else if (p === '/application')
        body = {
          id: 'application-linked',
          name: 'Aplicação preservada',
          form: { type: 'PSYCHOSOCIAL' },
        };
      else if (p === '/versions') {
        if (
          versionMode === 'slow' ||
          (versionMode === 'race' && ++versionCalls === 1)
        )
          await pending;
        if (versionMode === 'error') status = 503;
        body = {
          data: [
            {
              version: '0.0.0',
              documentCreatedAt: '2026-01-01',
              documentDate: '2026-01-01',
              created_at: '2026-01-01',
              officialRevisionSeries: 1,
            },
            { version: '5.0.0', officialRevisionSeries: 2 },
          ],
          count: 2,
        };
      } else if (p === '/document-data')
        body = {
          officialRevisionSeries: 1,
          validityYears: 2,
          validityMonths: 0,
        };
      else if (p.startsWith('/risk/')) {
        if (riskMode === 'error') status = 503;
        body = {
          data: [
            { id: 'r1', name: 'Risco um', type: 'ACI', isPGR: true },
            { id: 'r2', name: 'Risco dois', type: 'ACI', isPGR: true },
          ],
          count: 2,
        };
      } else if (p === '/upsert') body = { id: 'document-fixture' };
      else if (p === '/create' || p === '/regenerate') {
        creates.push(route.request().postDataJSON());
        body = { id: 'version-fixture' };
      } else throw new Error('Unexpected fixture route ' + p);
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    const state = {
      page,
      creates,
      requests,
      release,
      setApps: (v) => (appMode = v),
      setRisks: (v) => (riskMode = v),
      setVersions: (v) => (versionMode = v),
    };
    await page.goto(
      origin +
        '/?' +
        new URLSearchParams({
          ...(options.linked ? { linked: '1' } : {}),
          ...(options.company ? { company: options.company } : {}),
        }),
    );
    try {
      await run(state);
      assert.deepEqual(errors, []);
      console.log('PASS', name);
      cases++;
    } finally {
      release();
      await page.close();
    }
  }
  try {
    await scenario(
      'Sem FRPS submits REV02 while optional applications stay pending',
      { apps: 'slow' },
      async ({ page, creates }) => {
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
        await page
          .getByRole('button', { name: 'Criar versão', exact: true })
          .click();
        await page.waitForFunction(() => true);
        await page.waitForTimeout(100);
        assert.equal(creates.length, 1);
        assert.equal(creates[0].version, '0.0.1');
        assert.equal(creates[0].formApplicationId, undefined);
      },
    );
    await scenario(
      'Sem FRPS submits when optional applications fail',
      { apps: 'error' },
      async ({ page, creates }) => {
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
        await page
          .getByRole('button', { name: 'Criar versão', exact: true })
          .click();
        await page.waitForTimeout(100);
        assert.equal(creates.length, 1);
      },
    );
    await scenario(
      'Inherited binding blocks while loading, then preserves id and risk filter',
      { apps: 'slow', linked: true },
      async ({ page, creates, release }) => {
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
        await page
          .getByRole('button', { name: 'Criar versão', exact: true })
          .click();
        await page.waitForTimeout(100);
        assert.equal(creates.length, 0);
        assert.match(
          (await page.evaluate(() => window.messages)).join(),
          /aplicação psicossocial/,
        );
        release();
        await page.getByText('Aplicação preservada', { exact: true }).waitFor();
        await page
          .getByRole('button', { name: 'Criar versão', exact: true })
          .click();
        await page.waitForTimeout(100);
        assert.equal(creates[0].formApplicationId, 'application-linked');
        assert.deepEqual(creates[0].riskFilter, {
          mode: 'EXCLUDE',
          excludedRiskFactorIds: ['r1'],
        });
      },
    );
    await scenario(
      'Revision loading has no provisional REV01, failure blocks and retry resolves REV02',
      { versions: 'error' },
      async ({ page, creates, setVersions }) => {
        await page
          .getByTestId('version')
          .getByText('Erro de revisão')
          .waitFor();
        await page
          .getByRole('button', { name: 'Criar versão', exact: true })
          .click();
        assert.equal(creates.length, 0);
        setVersions('ready');
        await page.getByRole('button', { name: 'Repetir revisão' }).click();
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
      },
    );
    await scenario(
      'Slow revision never displays REV01 or permits early submit',
      { versions: 'slow' },
      async ({ page, creates, release }) => {
        await page
          .getByTestId('version')
          .getByText('Consultando próxima revisão…')
          .waitFor();
        await page
          .getByRole('button', { name: 'Criar versão', exact: true })
          .click();
        assert.equal(creates.length, 0);
        release();
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
      },
    );
    await scenario(
      'Risk error preserves saved exclusions; retry and confirm preserve recorte',
      { linked: true, risks: 'error' },
      async ({ page, setRisks }) => {
        await page
          .getByRole('button', { name: 'Filtrar riscos', exact: true })
          .click();
        await page
          .getByText(
            'Não foi possível carregar os riscos. Suas seleções foram preservadas.',
          )
          .waitFor();
        assert.equal(
          await page
            .getByRole('button', { name: 'Confirmar', exact: true })
            .isEnabled(),
          false,
        );
        assert.match(await page.getByTestId('risk-filter').innerText(), /r1/);
        setRisks('ready');
        await page
          .getByRole('button', { name: 'Tentar novamente', exact: true })
          .click();
        await page.getByLabel('Risco um', { exact: true }).waitFor();
        assert.equal(
          await page.getByLabel('Risco um', { exact: true }).isChecked(),
          false,
        );
        await page
          .getByRole('button', { name: 'Confirmar', exact: true })
          .click();
        assert.match(await page.getByTestId('risk-filter').innerText(), /r1/);
      },
    );

    await scenario(
      'Official family ignores another series and test family retains its sequence',
      {},
      async ({ page }) => {
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
        await page
          .getByRole('button', { name: 'Oficial', exact: true })
          .click();
        await page
          .getByTestId('version')
          .getByText('REV. 01', { exact: true })
          .waitFor();
        await page.getByRole('button', { name: 'Teste', exact: true }).click();
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
      },
    );
    await scenario(
      'Reopening in another company keeps scope and reloads next revision',
      { company: 'company-small' },
      async ({ page, requests }) => {
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
        const before = requests.filter((p) => p === '/versions').length;
        await page
          .getByRole('button', { name: 'Reabrir modal', exact: true })
          .click();
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
        assert.ok(requests.filter((p) => p === '/versions').length > before);
      },
    );
    await scenario(
      'Risk draft survives background failure and retry',
      { linked: true },
      async ({ page, setRisks }) => {
        await page
          .getByRole('button', { name: 'Filtrar riscos', exact: true })
          .click();
        await page.getByLabel('Risco dois', { exact: true }).uncheck();
        setRisks('error');
        await page.evaluate(() => window.refetchRisks());
        await page
          .getByText(
            'Não foi possível carregar os riscos. Suas seleções foram preservadas.',
          )
          .waitFor();
        setRisks('ready');
        await page
          .getByRole('button', { name: 'Tentar novamente', exact: true })
          .click();
        await page.getByLabel('Risco dois', { exact: true }).waitFor();
        assert.equal(
          await page.getByLabel('Risco dois', { exact: true }).isChecked(),
          false,
        );
        assert.equal(
          await page.getByLabel('Risco um', { exact: true }).isChecked(),
          false,
        );
      },
    );

    await scenario(
      'Inherited application failure blocks submission without erasing its binding',
      { apps: 'error', linked: true },
      async ({ page, creates }) => {
        await page
          .getByTestId('version')
          .getByText('REV. 02', { exact: true })
          .waitFor();
        await page
          .getByRole('button', { name: 'Criar versão', exact: true })
          .click();
        await page.waitForTimeout(100);
        assert.equal(creates.length, 0);
        assert.match(
          (await page.evaluate(() => window.messages)).join(),
          /falha ao carregar a aplicação/,
        );
        assert.match(await page.getByTestId('risk-filter').innerText(), /r1/);
      },
    );
    await scenario(
      'Late test-family response cannot overwrite the newer official-family selection',
      { versions: 'race' },
      async ({ page, release }) => {
        await page
          .getByTestId('version')
          .getByText('Consultando próxima revisão…')
          .waitFor();
        await page
          .getByRole('button', { name: 'Oficial', exact: true })
          .click();
        await page
          .getByTestId('version')
          .getByText('REV. 01', { exact: true })
          .waitFor();
        release();
        await page.waitForTimeout(100);
        assert.equal(await page.getByTestId('version').innerText(), 'REV. 01');
      },
    );
    console.log(`${cases} browser scenarios passed`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
