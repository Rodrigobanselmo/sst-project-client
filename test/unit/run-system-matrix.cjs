// Isolated runner for these existing TypeScript utility specs. Production aliases
// and source files are unchanged; TypeScript is already a development dependency.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const Module = require('node:module');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const sourceRoot = path.join(root, 'src');
const specRoot = path.join(sourceRoot, '@v2/pages/master/system-risk-matrix/utils');
const specs = [
  'system-risk-matrix-draft.util.spec.ts',
  'system-risk-matrix-editorial.util.spec.ts',
  'system-risk-matrix-view.util.spec.ts',
];

if (process.argv.length === 2) {
  let failed = 0;
  for (const spec of specs) {
    const result = spawnSync(process.execPath, [__filename, '--run-spec', spec], {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    });
    if (result.error) console.error(result.error);
    if (result.error || result.signal || result.status !== 0) failed += 1;
  }
  console.log(`SYSTEM matrix utility suites: ${specs.length - failed}/${specs.length} passed`);
  process.exitCode = failed ? 1 : 0;
} else {
  assert.equal(process.argv.length, 4, 'Only a whitelisted utility spec is accepted');
  assert.equal(process.argv[2], '--run-spec');
  const spec = process.argv[3];
  assert(specs.includes(spec), 'Only a whitelisted utility spec is accepted');

  const ts = require('typescript');
  const resolveFilename = Module._resolveFilename;
  const previousTs = require.extensions['.ts'];
  const isSource = (filename) => filename.startsWith(sourceRoot + path.sep);
  const aliasPrefixes = ['@v2/', 'core/', 'project/'];

  Module._resolveFilename = function (request, parent, ...rest) {
    if (
      parent && isSource(parent.filename) &&
      aliasPrefixes.some((prefix) => request.startsWith(prefix))
    ) {
      const resolved = path.resolve(sourceRoot, request);
      assert(isSource(resolved), 'Source alias must remain inside src');
      return resolveFilename.call(this, resolved, parent, ...rest);
    }
    return resolveFilename.call(this, request, parent, ...rest);
  };

  require.extensions['.ts'] = function (module, filename) {
    assert(isSource(filename), 'The test compiler accepts only this project source');
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
      fileName: filename,
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        isolatedModules: true,
      },
    });
    const errors = compiled.diagnostics?.filter((item) => item.category === ts.DiagnosticCategory.Error) ?? [];
    assert.equal(errors.length, 0, ts.formatDiagnosticsWithColorAndContext(errors, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }));
    module._compile(compiled.outputText, filename);
  };

  try {
    process.chdir(root);
    require(path.join(specRoot, spec));
  } finally {
    Module._resolveFilename = resolveFilename;
    if (previousTs) require.extensions['.ts'] = previousTs;
    else delete require.extensions['.ts'];
  }
}
