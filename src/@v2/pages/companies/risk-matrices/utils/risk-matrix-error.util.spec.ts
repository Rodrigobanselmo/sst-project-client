/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-error.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  getRiskMatrixApiErrorBody,
  getRiskMatrixApiErrorMessage,
} from './risk-matrix-error.util';

assert.equal(getRiskMatrixApiErrorBody(undefined), null);
assert.deepEqual(
  getRiskMatrixApiErrorBody({
    response: {
      data: {
        message: 'Já existe um DRAFT para esta matriz',
        code: 'RISK_MATRIX_DRAFT_EXISTS',
      },
    },
  }),
  {
    message: 'Já existe um DRAFT para esta matriz',
    code: 'RISK_MATRIX_DRAFT_EXISTS',
  },
);

assert.equal(
  getRiskMatrixApiErrorMessage(
    {
      response: {
        data: { message: 'Nome da matriz é obrigatório' },
      },
    },
    'fallback',
  ),
  'Nome da matriz é obrigatório',
);
assert.equal(
  getRiskMatrixApiErrorMessage(new Error('boom'), 'Não foi possível carregar'),
  'boom',
);
assert.equal(
  getRiskMatrixApiErrorMessage(null, 'Não foi possível carregar'),
  'Não foi possível carregar',
);

console.log('risk-matrix-error.util.spec.ts OK');
