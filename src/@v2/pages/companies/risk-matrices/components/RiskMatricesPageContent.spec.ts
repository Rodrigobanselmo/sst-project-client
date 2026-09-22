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
const editorSource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/RiskMatrixEditorPageContent.tsx',
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

// CUSTOM PUBLISHED → Visualizar matriz (versão publicada, não draft)
assert.ok(pageSource.includes('RISK_MATRIX_VIEW_PUBLISHED_ACTION'));
assert.ok(pageSource.includes('canViewPublishedRiskMatrix'));
assert.ok(pageSource.includes('handleViewPublished'));
assert.ok(pageSource.includes('onViewPublished'));
assert.ok(pageSource.includes('showViewPublishedAction'));
assert.ok(pageSource.includes('getRiskMatrixVersionEditorPath'));
assert.ok(pageSource.includes('RISK_MATRIX_MANAGE_AVAILABILITY_ACTION'));
assert.ok(pageSource.includes('canOpenWorkspaceAvailability'));
assert.ok(pageSource.includes('canDuplicateRiskMatrix'));
assert.ok(pageSource.includes('Editar rascunho'));
assert.ok(pageSource.includes('Duplicar'));

const viewHandlerStart = pageSource.indexOf('const handleViewPublished');
assert.ok(viewHandlerStart >= 0);
const viewHandlerEnd = pageSource.indexOf(
  'const handleCreate',
  viewHandlerStart,
);
const viewHandler = pageSource.slice(viewHandlerStart, viewHandlerEnd);
assert.ok(viewHandler.includes('latestPublishedVersion.id'));
assert.equal(viewHandler.includes('draftVersion'), false);

// Editor: PUBLISHED = read-only; não promove a DRAFT; bands visíveis
assert.ok(
  editorSource.includes(
    'version?.status === CompanyRiskMatrixVersionStatusEnum.PUBLISHED',
  ),
);
assert.ok(editorSource.includes('shouldShowRiskMatrixPublishActions'));
assert.ok(editorSource.includes('useFetchReadRiskMatrixVersion'));
assert.ok(editorSource.includes('Compatibilidade SimpleSST:'));
assert.ok(editorSource.includes('classification.compatibilityBands.join'));
assert.equal(
  editorSource.includes('status: CompanyRiskMatrixVersionStatusEnum.DRAFT'),
  false,
);

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
