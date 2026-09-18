/**
 * Executar:
 * npx tsx src/@v2/constants/routes/risk-matrix.routes.spec.ts
 */
import assert from 'node:assert/strict';

import { RiskMatrixRoutes } from './risk-matrix.routes';

assert.equal(
  RiskMatrixRoutes.DUPLICATE,
  'v2/companies/:companyId/risk-matrices/:matrixId/duplicate',
);

console.log('risk-matrix.routes.spec.ts OK');
