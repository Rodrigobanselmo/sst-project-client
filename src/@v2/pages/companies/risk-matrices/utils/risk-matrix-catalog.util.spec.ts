/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-catalog.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  CompanyRiskMatrixStatusEnum,
  CompanyRiskMatrixVersionStatusEnum,
  RiskMatrixCoverageKeyEnum,
  type RiskMatrixBrowseItem,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  catalogEstablishmentAvailabilityLabel,
  catalogPublishedCoverageCount,
  canDuplicateRiskMatrix,
  canDeleteCatalogDraft,
  canOpenWorkspaceAvailability,
  canViewPublishedRiskMatrix,
  deleteCatalogDraftRemovesIdentity,
  hasCatalogDraft,
  mapBrowseRiskMatrices,
} from './risk-matrix-catalog.util';
import {
  RISK_MATRIX_DELETE_DRAFT_ACTION,
  RISK_MATRIX_DELETE_DRAFT_KEEP_PUBLISHED_CONFIRMATION,
  RISK_MATRIX_DELETE_DRAFT_ONLY_CONFIRMATION,
  RISK_MATRIX_VIEW_PUBLISHED_ACTION,
} from '../maps/risk-matrix.maps';

const matrix: RiskMatrixBrowseItem = {
  id: 'matrix-1',
  companyId: 'company-1',
  name: 'Matriz A',
  description: 'Desc',
  status: CompanyRiskMatrixStatusEnum.ACTIVE,
  archivedAt: null,
  latestPublishedVersion: {
    id: 'pub-1',
    versionNumber: 2,
    status: CompanyRiskMatrixVersionStatusEnum.PUBLISHED,
    publishedAt: '2026-01-01T00:00:00.000Z',
    nameSnapshot: 'Matriz A',
    coverages: [RiskMatrixCoverageKeyEnum.FIS, RiskMatrixCoverageKeyEnum.QUI],
  },
  draftVersion: {
    id: 'draft-1',
    versionNumber: 3,
    status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
  },
  hasActiveBindings: true,
};

assert.deepEqual(mapBrowseRiskMatrices(undefined), []);
assert.deepEqual(mapBrowseRiskMatrices({ results: [matrix] }), [matrix]);
assert.equal(hasCatalogDraft(matrix), true);
assert.equal(
  hasCatalogDraft({ ...matrix, draftVersion: null }),
  false,
);
assert.equal(catalogPublishedCoverageCount(matrix), 2);
assert.equal(
  catalogPublishedCoverageCount({ ...matrix, latestPublishedVersion: null }),
  0,
);
assert.equal(canOpenWorkspaceAvailability(matrix), true);
assert.equal(
  canOpenWorkspaceAvailability({ ...matrix, latestPublishedVersion: null }),
  false,
);
assert.equal(
  canOpenWorkspaceAvailability({
    ...matrix,
    status: CompanyRiskMatrixStatusEnum.ARCHIVED,
  }),
  false,
);
assert.equal(canViewPublishedRiskMatrix(matrix), true);
assert.equal(
  canViewPublishedRiskMatrix({ ...matrix, latestPublishedVersion: null }),
  false,
);
assert.equal(
  canViewPublishedRiskMatrix({
    ...matrix,
    status: CompanyRiskMatrixStatusEnum.ARCHIVED,
  }),
  true,
);
assert.equal(RISK_MATRIX_VIEW_PUBLISHED_ACTION, 'Visualizar matriz');
assert.equal(canDuplicateRiskMatrix(matrix), true);
assert.equal(
  canDuplicateRiskMatrix({
    ...matrix,
    latestPublishedVersion: null,
  }),
  true,
);
assert.equal(
  canDuplicateRiskMatrix({
    ...matrix,
    status: CompanyRiskMatrixStatusEnum.ARCHIVED,
  }),
  true,
);
assert.equal(
  canDuplicateRiskMatrix({
    ...matrix,
    latestPublishedVersion: null,
    draftVersion: null,
  }),
  false,
);
assert.equal(canDeleteCatalogDraft(matrix), true);
assert.equal(
  canDeleteCatalogDraft({ ...matrix, draftVersion: null }),
  false,
);
assert.equal(deleteCatalogDraftRemovesIdentity(matrix), false);
assert.equal(
  deleteCatalogDraftRemovesIdentity({
    ...matrix,
    latestPublishedVersion: null,
  }),
  true,
);
assert.equal(
  deleteCatalogDraftRemovesIdentity({ ...matrix, draftVersion: null }),
  false,
);

assert.equal(RISK_MATRIX_DELETE_DRAFT_ACTION, 'Excluir rascunho');
assert.match(
  RISK_MATRIX_DELETE_DRAFT_ONLY_CONFIRMATION.message,
  /sairá do catálogo/,
);
assert.match(
  RISK_MATRIX_DELETE_DRAFT_KEEP_PUBLISHED_CONFIRMATION.message,
  /versão publicada permanece/,
);
assert.equal(
  RISK_MATRIX_DELETE_DRAFT_ONLY_CONFIRMATION.confirmText,
  'Excluir rascunho',
);
assert.equal(
  RISK_MATRIX_DELETE_DRAFT_KEEP_PUBLISHED_CONFIRMATION.confirmText,
  'Excluir rascunho',
);
assert.equal(
  catalogEstablishmentAvailabilityLabel({
    ...matrix,
    hasActiveBindings: false,
  }),
  'Nenhum estabelecimento',
);
assert.equal(catalogEstablishmentAvailabilityLabel(matrix), null);
assert.equal(
  catalogEstablishmentAvailabilityLabel({
    ...matrix,
    latestPublishedVersion: null,
    hasActiveBindings: false,
  }),
  null,
);

console.log('risk-matrix-catalog.util.spec.ts OK');
