/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-permission.util.spec.ts
 */
import assert from 'node:assert/strict';

import { PermissionEnum } from 'project/enum/permission.enum';

import { canWriteRiskMatrix } from './risk-matrix-permission.util';

assert.equal(
  canWriteRiskMatrix({
    isAuthSuccess: ({ permissions, cruds }) =>
      permissions?.includes(PermissionEnum.RISK) === true && cruds === 'c',
  }),
  true,
);

assert.equal(
  canWriteRiskMatrix({
    isAuthSuccess: () => false,
  }),
  false,
);

assert.equal(
  canWriteRiskMatrix({
    isAuthSuccess: ({ permissions }) =>
      permissions?.includes(PermissionEnum.RISK) === true,
  }),
  true,
);

console.log('risk-matrix-permission.util.spec.ts OK');
