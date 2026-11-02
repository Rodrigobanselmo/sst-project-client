// Run the upstream GSE/AI utility contracts against this integrated client.
// Only compilation is bundled; assertions execute unchanged in isolated Node processes.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const esbuild = require(require.resolve('esbuild', { paths: [root, path.resolve(root, '../sst-project-api')] }));
const directory = path.join(root, 'src/components/organisms/main/Tree/OrgTree/components/GseVisualAssistance');
const files = fs.readdirSync(directory).filter(file => file.endsWith('.spec.ts')).map(file => path.join(directory, file));
files.push(path.join(root, 'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/probability-ai-result.util.spec.ts'));
let failed = 0;
for (const file of files) {
  const compiled = esbuild.buildSync({ entryPoints: [file], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', tsconfig: path.join(root, 'tsconfig.json'), logLevel: 'silent' });
  const result = spawnSync(process.execPath, ['-'], { input: compiled.outputFiles[0].text, encoding: 'utf8', cwd: root, env: { ...process.env, NODE_ENV: 'test' } });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) failed++;
  console.log(result.status === 0 ? 'PASS' : 'FAIL', path.relative(root, file));
}
console.log(`${files.length - failed}/${files.length} GSE/AI suites passed`);
process.exitCode = failed ? 1 : 0;
