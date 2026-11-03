const { spawn } = require('node:child_process');
const { resolve } = require('node:path');
const { existsSync } = require('node:fs');
const webRoot = resolve(__dirname, '../..');
const apiRoot = resolve(
  process.env.E2E_API_ROOT || resolve(webRoot, '../sst-project-api'),
);
if (!existsSync(resolve(apiRoot, 'test/api/run.cjs')))
  throw new Error('API checkout missing. Set E2E_API_ROOT to sst-project-api.');
if (Number(process.versions.node.split('.')[0]) !== 22)
  throw new Error('Use Node 22 (same runtime as the API).');
const child = spawn(
  process.execPath,
  [resolve(apiRoot, 'test/api/run.cjs'), '--browser', '--web-root', webRoot],
  { cwd: apiRoot, stdio: 'inherit', env: process.env },
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => child.kill(signal));
child.once('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.once('exit', (code) => {
  process.exitCode = code ?? 1;
});
