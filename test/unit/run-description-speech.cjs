// Pure local synthesis/settings tests. No browser, provider or application API.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '../..');
const result = esbuild.buildSync({
  entryPoints: [
    path.join(
      root,
      'src/@v2/components/molecules/DescriptionTextActions/local-description-speech.spec.ts',
    ),
  ],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  tsconfig: path.join(root, 'tsconfig.json'),
});
const run = spawnSync(process.execPath, ['-'], {
  input: result.outputFiles[0].text,
  encoding: 'utf8',
  cwd: root,
});
process.stdout.write(run.stdout || '');
process.stderr.write(run.stderr || '');
process.exitCode = run.status ?? 1;
