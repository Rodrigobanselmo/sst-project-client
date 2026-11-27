const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
require('tsconfig-paths').register({ baseUrl: process.cwd() + '/src', paths: {} });
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, file);
const originalLoad = Module._load;
let confirmation;
const forbiddenLookup = () => { throw new Error('Paste must reuse the source ID without creating or looking up a replacement'); };
Module._load = function (request, ...args) {
  if (request === 'react') return { useCallback: (fn) => fn };
  if (request === 'notistack') return { useSnackbar: () => ({ enqueueSnackbar() {} }) };
  if (request === 'core/hooks/useGetCompanyId') return { useGetCompanyId: () => ({ companyId: 'tenant' }) };
  if (request === 'core/hooks/useTabWorkspaceId') return { useTabWorkspaceId: () => ({ workspaceId: 'workspace' }) };
  if (request === 'core/hooks/usePreventAction') return { usePreventAction: () => ({ preventWarn: (_message, callback) => { confirmation = callback(); } }) };
  if (request.includes('/queries/useQueryRecMed/')) return { queryRecMed: forbiddenLookup };
  if (request.includes('/queries/useQueryGenerateSource/')) return { queryGenerateSource: forbiddenLookup };
  if (request.endsWith('/queries/useQueryEpis')) return { queryEpis: forbiddenLookup };
  // Probability calculations have their own tests. Here we exercise the actual batch
  // resolution and mutation payload, with only its residual calculation isolated.
  if (request === './rec-attach-residual.util') return {
    validRiskDataRecs: (row) => row?.recs ?? [],
    withRecAttachResidual: ({ payload }) => payload,
    buildRecAttachPayload: () => { throw new Error('Batch test must use its batch payload'); },
  };
  return originalLoad.call(this, request, ...args);
};
(async () => {
  try {
    const { useRiskCatalogDndCopy } = require('../../src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-dnd/useRiskCatalogDndCopy.ts');
    const hook = useRiskCatalogDndCopy();
    for (const kind of ['rec', 'adm', 'eng']) {
      const source = { kind, catalogId: 'original-catalogue-id', sourceRiskId: 'benzene', name: 'Treinar motoristas', recType: 'ADM', medType: kind === 'eng' ? 'ENG' : 'ADM' };
      const payloads = [];
      const dest = { risk: { id: 'gasoline', name: 'Gasolina' }, riskData: { recs: [], adms: [], engs: [] }, handleSelect: async (payload) => { payloads.push(payload); } };
      await hook.onBatchCopyToDestination([source], dest);
      await confirmation;
      assert.equal(payloads.length, 1);
      const payload = payloads[0];
      assert.equal(payload.recAddOnly, undefined);
      assert.equal(payload.admsAddOnly, undefined);
      assert.equal(payload.engsAddOnly, undefined);
      if (kind === 'rec') assert.deepEqual(payload.recs, ['original-catalogue-id']);
      if (kind === 'adm') assert.deepEqual(payload.adms, ['original-catalogue-id']);
      if (kind === 'eng') assert.deepEqual(payload.engs, [{ recMedId: 'original-catalogue-id' }]);
      // A repeated paste is a no-op for an already linked item.
      dest.riskData[kind === 'rec' ? 'recs' : kind === 'adm' ? 'adms' : 'engs'] = [{ id: source.catalogId, recName: source.name, medName: source.name, recType: source.recType }];
      await hook.onBatchCopyToDestination([source], dest);
      await confirmation;
      assert.equal(payloads.length, 1);
    }
    console.log('Batch paste passed: original IDs preserved for recommendations, ADM and ENG; repeated paste is a no-op.');
  } finally { Module._load = originalLoad; }
})().catch((error) => { console.error(error); process.exitCode = 1; });
