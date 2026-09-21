/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/components/RiskMatricesPageContent.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pageSource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/RiskMatricesPageContent.tsx',
  'utf8',
);
const mutationSource = readFileSync(
  'src/@v2/services/security/risk-matrix/hooks/useMutateRiskMatrix.ts',
  'utf8',
);
const serviceSource = readFileSync(
  'src/@v2/services/security/risk-matrix/service/risk-matrix.service.ts',
  'utf8',
);

assert.ok(pageSource.includes('RISK_MATRIX_DELETE_DRAFT_ACTION'));
assert.ok(pageSource.includes('canDeleteCatalogDraft'));
assert.ok(pageSource.includes('deleteCatalogDraftRemovesIdentity'));
assert.ok(pageSource.includes('RISK_MATRIX_DELETE_DRAFT_ONLY_CONFIRMATION'));
assert.ok(
  pageSource.includes('RISK_MATRIX_DELETE_DRAFT_KEEP_PUBLISHED_CONFIRMATION'),
);
assert.ok(pageSource.includes("variant: 'danger'"));
assert.ok(pageSource.includes('useMutateDeleteRiskMatrixDraft'));
assert.ok(pageSource.includes('showDeleteDraftAction'));
assert.ok(pageSource.includes('onDeleteDraft'));
assert.equal(pageSource.includes('Excluir matriz'), false);
assert.equal(pageSource.includes('archiveRiskMatrix'), false);
assert.equal(pageSource.includes('setQueryData'), false);

const deleteHookStart = mutationSource.indexOf(
  'export const useMutateDeleteRiskMatrixDraft',
);
assert.ok(deleteHookStart >= 0);
const nextExport = mutationSource.indexOf(
  'export const useMutateReplaceRiskMatrixDraft',
  deleteHookStart,
);
const deleteHook = mutationSource.slice(
  deleteHookStart,
  nextExport === -1 ? undefined : nextExport,
);
assert.ok(deleteHook.includes('deleteRiskMatrixDraft'));
assert.ok(deleteHook.includes('invalidateQueries'));
assert.equal(deleteHook.includes('setQueryData'), false);
assert.equal(deleteHook.includes('onMutate'), false);
assert.ok(deleteHook.includes('A matriz saiu do catálogo'));
assert.ok(deleteHook.includes('A versão publicada foi preservada'));

assert.ok(serviceSource.includes('export async function deleteRiskMatrixDraft'));
assert.ok(serviceSource.includes('api.delete<DeleteRiskMatrixDraftResponse>'));
assert.ok(serviceSource.includes('RiskMatrixRoutes.VERSION'));
assert.equal(serviceSource.includes('RiskMatrixRoutes.ARCHIVE'), false);

console.log('RiskMatricesPageContent.spec.ts OK');
