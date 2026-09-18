/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-paths.util.spec.ts
 */
import assert from 'node:assert/strict';

import { RoutesEnum } from 'core/enums/routes.enums';

import { CompanyRiskMatrixVersionStatusEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  getRiskMatricesPath,
  getRiskMatrixVersionEditorPath,
  resolveCreatedRiskMatrixEditorPath,
} from './risk-matrix-paths.util';

const companyId = 'company-1';
const matrixId = 'matrix-1';
const draftId = 'draft-1';

assert.equal(
  getRiskMatricesPath(companyId),
  '/dashboard/empresas/company-1/matrizes-risco',
);
assert.equal(
  getRiskMatrixVersionEditorPath(companyId, matrixId, draftId),
  '/dashboard/empresas/company-1/matrizes-risco/matrix-1/versoes/draft-1',
);
assert.equal(
  getRiskMatrixVersionEditorPath(companyId, matrixId, draftId),
  RoutesEnum.RISK_MATRIX_VERSION.replace(':companyId', companyId)
    .replace(':matrixId', matrixId)
    .replace(':versionId', draftId),
);

assert.equal(
  resolveCreatedRiskMatrixEditorPath(companyId, {
    id: matrixId,
    draftVersion: {
      id: draftId,
      versionNumber: 1,
      status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
    },
  }),
  '/dashboard/empresas/company-1/matrizes-risco/matrix-1/versoes/draft-1',
);

assert.equal(
  resolveCreatedRiskMatrixEditorPath(companyId, {
    id: matrixId,
    draftVersion: null,
  }),
  null,
);

assert.equal(
  resolveCreatedRiskMatrixEditorPath('', {
    id: matrixId,
    draftVersion: {
      id: draftId,
      versionNumber: 1,
      status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
    },
  }),
  null,
);

console.log('risk-matrix-paths.util.spec.ts OK');
