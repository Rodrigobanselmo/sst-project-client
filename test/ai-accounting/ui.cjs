// Real browser + actual MUI theme. All account/provider HTTP boundaries are synthetic.
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http');
const root = path.resolve(__dirname, '../..');
const esbuild = require(
  require.resolve('esbuild', {
    paths: [root, path.resolve(root, '../sst-project-api')],
  }),
);
const { chromium } = require('@playwright/test');
const artifacts =
  process.env.AI_UI_ARTIFACT_DIR || fs.mkdtempSync('/tmp/sst-ai-ui-');
fs.mkdirSync(artifacts, { recursive: true });
let server, browser;
const authStub = `export const useAuth=()=>({user:{id:1,companyId:'synthetic-platform',roles:['master']}});`;
const officialCatalog = JSON.parse(
  fs.readFileSync(
    path.resolve(
      root,
      '../sst-project-api/src/ai-accounting/official-pricing-catalog.json',
    ),
    'utf8',
  ),
);
const automaticFixtures = officialCatalog.models.map((t) => ({
  ...t,
  version: 0,
  origin: 'OFFICIAL',
  canCustomize: !(
    t.longContext ||
    t.kind === 'image' ||
    t.periods.length ||
    t.cacheWrite30mUsdPerMillion
  ),
  hasOfficialPrice: true,
  audioUsdPerMinute: t.audioUsdPerMinute || '0',
  requestUsd: '0',
  validUntil: t.validUntil || officialCatalog.validUntil,
  pricingNote: t.longContext
    ? `Acima de ${t.longContext.aboveInputTokens} tokens de entrada: entrada US$ ${t.longContext.inputUsdPerMillion}/milhão e saída US$ ${t.longContext.outputUsdPerMillion}/milhão.`
    : t.note,
}));
const apiStub = `
const state={infrastructureEnabled:true,timezone:'America/Sao_Paulo',policies:[{scope:'GLOBAL',limitUsd:'50',spentUsd:'12.3456',availableUsd:'37.6544',enabled:true,version:1},...['USER:*','COMPANY:*','SYSTEM:*'].map(scope=>({scope,limitUsd:'5',spentUsd:'0',enabled:true,version:1}))],tariffs:[{provider:'openai',model:'synthetic-custom-model',version:1,inputUsdPerMillion:'1',cachedInputUsdPerMillion:'0.5',outputUsdPerMillion:'2',audioUsdPerMinute:'0',sourceUrl:'https://example.invalid/synthetic-pricing',validUntil:new Date(Date.now()+10*86400000).toISOString()}]};
state.tariffs.push(...${JSON.stringify(automaticFixtures)});state.catalog=${JSON.stringify({ ...officialCatalog, models: undefined, modelCount: officialCatalog.models.length })};
window.__fixture={state,puts:[],denied:false,reports:0};
export const api={get:async(url,options={})=>{if(window.__fixture.denied)throw {response:{data:{message:'Controle financeiro restrito ao MASTER global.'}}};const params=options.params||{};if(url.endsWith('/state'))return {data:structuredClone(state)};if(url.endsWith('/lookups'))return {data:params.kind==='company'?[{id:'company-a',label:'Cliente de demonstração'}]:[{id:'1',label:'Pessoa de demonstração'}]};if(url.endsWith('/report')){window.__fixture.reports++;return {data:{data:[{key:params.group==='workflow'?'CHAT':params.group==='user'?'1':'company-a',companyName:'Cliente de demonstração',userName:'Pessoa de demonstração',payerName:'SimpleSST',calls:'8',costUnits:'123456000000',costUsd:'12.3456',unmeteredCalls:'1'}]}};}if(url.endsWith('/history'))return {data:[{id:'synthetic-attempt',userName:'Pessoa de demonstração',companyName:'Cliente de demonstração',workflow:'CHAT',stage:'chat.classification',model:'gpt-6.1-sol',status:'UNKNOWN',costUsd:null,startedAt:new Date().toISOString()}]};return {data:[]};},put:async(url,body)=>{window.__fixture.puts.push({url,body});if(url.endsWith('/policy')){let p=state.policies.find(p=>p.scope===body.scope);if(p){Object.assign(p,body);p.version++;}else state.policies.push({...body,version:1,spentUsd:'0'});}return {data:{saved:true}};}};`;
(async () => {
  const result = await esbuild.build({
    stdin: {
      contents: `import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{ThemeProvider,CssBaseline,Box}from'@mui/material';import{LocalizationProvider}from'@mui/x-date-pickers';import{AdapterDayjs}from'@mui/x-date-pickers/AdapterDayjs';import{SnackbarProvider}from'notistack';import{createCustomTheme}from'./src/configs/theme';import{AiConsumptionPage}from'./src/@v2/features/ai-accounting/AiConsumptionPage';import{AiAccountingNotice}from'./src/@v2/features/ai-accounting/AiAccountingNotice';import{publishAiAccountingNotice}from'./src/@v2/features/ai-accounting/ai-accounting-notice';window.__announce=publishAiAccountingNotice;const q=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false}}});createRoot(document.getElementById('root')).render(<ThemeProvider theme={createCustomTheme()}><CssBaseline/><LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br"><QueryClientProvider client={q}><SnackbarProvider><AiAccountingNotice/><Box sx={{px:'24px',maxWidth:'1440px',mx:'auto'}}><AiConsumptionPage/></Box></SnackbarProvider></QueryClientProvider></LocalizationProvider></ThemeProvider>);`,
      resolveDir: root,
      loader: 'tsx',
    },
    absWorkingDir: root,
    bundle: true,
    platform: 'browser',
    format: 'iife',
    jsx: 'automatic',
    write: false,
    define: { 'process.env.NODE_ENV': '"test"' },
    plugins: [
      {
        name: 'synthetic-account-boundaries',
        setup(build) {
          build.onResolve(
            {
              filter:
                /^(core\/contexts\/AuthContext|core\/services\/apiClient)$/,
            },
            (args) => ({ path: args.path, namespace: 'stub' }),
          );
          build.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => ({
            contents: args.path.includes('AuthContext') ? authStub : apiStub,
            loader: 'js',
          }));
        },
      },
    ],
  });
  server = http.createServer((req, res) => {
    if (req.url === '/poppins.woff2') {
      res.setHeader('Content-Type', 'font/woff2');
      res.end(
        fs.readFileSync(
          require.resolve(
            '@fontsource/poppins/files/poppins-latin-400-normal.woff2',
          ),
        ),
      );
      return;
    }
    res.setHeader(
      'Content-Type',
      req.url === '/app.js' ? 'text/javascript' : 'text/html',
    );
    res.end(
      req.url === '/app.js'
        ? result.outputFiles[0].text
        : '<!doctype html><html lang="pt-BR"><head><style>@font-face{font-family:Poppins;src:url(/poppins.woff2)}body{font-family:Poppins,sans-serif}</style><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body><div id="root"></div><script src="/app.js"></script></body></html>',
    );
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', (route) =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort(),
  );
  await page.goto(origin);
  await page
    .getByRole('heading', { name: 'Consumo de IA', exact: true })
    .waitFor();
  await page
    .getByRole('cell', { name: 'Cliente de demonstração', exact: true })
    .waitFor();
  await page.screenshot({
    path: path.join(artifacts, 'desktop-consumption.png'),
    fullPage: true,
  });
  await page.getByRole('combobox', { name: 'Agrupar por' }).click();
  await page.getByRole('option', { name: 'Fluxo', exact: true }).click();
  await page.getByRole('cell', { name: 'Chat', exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Limites', exact: true }).click();
  await page
    .getByRole('row')
    .filter({ hasText: 'Padrão por usuário' })
    .getByRole('button', { name: 'Editar' })
    .click();
  await page
    .getByRole('textbox', { name: 'Máximo por dia (US$)' })
    .fill('2,50');
  await page.getByRole('button', { name: 'Salvar limite' }).click();
  await page
    .getByText('Limite salvo e registrado no histórico de alterações.')
    .waitFor();
  assert.equal(
    await page.evaluate(() => window.__fixture.puts[0].body.limitUsd),
    '2.50',
  );
  assert.equal(
    await page.evaluate(() => window.__fixture.puts[0].body.scope),
    'USER:*',
  );
  await page.getByRole('tab', { name: 'Tarifas', exact: true }).click();
  await page
    .getByText(
      'OpenAI e Gemini já usam o catálogo oficial incluído no sistema.',
      { exact: false },
    )
    .waitFor();
  assert.equal(
    await page.getByRole('textbox', { name: 'Modelo', exact: true }).count(),
    0,
    'manual price registration starts collapsed',
  );
  await page
    .getByRole('textbox', { name: 'Pesquisar modelo', exact: true })
    .fill('gpt-6.1-sol');
  await page
    .getByRole('cell', { name: 'openai / gpt-6.1-sol', exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole('button', { name: 'Personalizar', exact: true })
      .count(),
    0,
    'complex public prices keep their automatic rules',
  );
  await page.getByText('Ver regras', { exact: true }).click();
  await page
    .getByText('Acima de 272000 tokens de entrada:', { exact: false })
    .waitFor();
  await page.screenshot({
    path: path.join(artifacts, 'automatic-catalog-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(artifacts, 'automatic-catalog-mobile.png'),
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole('textbox', { name: 'Pesquisar modelo', exact: true })
    .fill('');
  await page
    .getByRole('combobox', { name: /Filtrar provedor/ })
    .click();
  await page.getByRole('option', { name: 'Gemini', exact: true }).click();
  await page
    .getByRole('cell', { name: 'gemini / gemini-4-argon', exact: true })
    .waitFor();
  await page
    .getByRole('combobox', { name: /Filtrar provedor/ })
    .click();
  await page.getByRole('option', { name: 'Todos', exact: true }).click();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByRole('textbox', { name: 'Modelo', exact: true }).waitFor();
  await page.screenshot({
    path: path.join(artifacts, 'desktop-tariffs.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  await page.screenshot({
    path: path.join(artifacts, 'mobile-tariffs.png'),
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    'narrow layout must not overflow the page',
  );
  await page.evaluate(() => {
    window.__announce({
      code: 'AI_DAILY_BUDGET_EXCEEDED',
      scope: 'USER',
      message:
        'O limite diário de IA do seu usuário foi atingido. O saldo renova à meia-noite de São Paulo.',
    });
    window.__announce({
      code: 'AI_DAILY_BUDGET_EXCEEDED',
      scope: 'USER',
      message:
        'O limite diário de IA do seu usuário foi atingido. O saldo renova à meia-noite de São Paulo.',
    });
  });
  await page
    .getByText(
      'O limite diário de IA do seu usuário foi atingido. O saldo renova à meia-noite de São Paulo.',
    )
    .waitFor();
  assert.equal(
    await page
      .getByText(
        'O limite diário de IA do seu usuário foi atingido. O saldo renova à meia-noite de São Paulo.',
      )
      .count(),
    1,
  );
  await page.waitForTimeout(350);
  await page.screenshot({
    path: path.join(artifacts, 'mobile-budget-notice.png'),
    fullPage: false,
  });
  assert.deepEqual(errors, []);
  process.stdout.write(
    JSON.stringify({
      passed: true,
      checks: [
        'summary',
        'flow breakdown',
        'budget editing and decimal normalization',
        'automatic official catalog and provider/model filters',
        'tariff editing',
        'mobile layout',
        'global refusal notice and deduplication',
      ],
      artifacts,
    }) + '\n',
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    await new Promise((resolve) =>
      server ? server.close(resolve) : resolve(),
    );
  });
