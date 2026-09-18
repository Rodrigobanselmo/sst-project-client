/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-error.util.spec.ts
 */
import assert from 'node:assert/strict';

import { RiskMatrixCoverageKeyEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  getRiskMatrixApiErrorBody,
  getRiskMatrixApiErrorMessage,
  formatRiskMatrixBindingConflicts,
  getRiskMatrixAvailabilityConflictMessage,
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

assert.equal(
  formatRiskMatrixBindingConflicts([]),
  null,
);
assert.equal(
  formatRiskMatrixBindingConflicts([
    {
      coverageKey: RiskMatrixCoverageKeyEnum.QUI,
      existingMatrixId: 'other',
      existingMatrixName: 'Outra QUI',
      existingVersionId: 'other-v1',
      existingVersionNumber: 1,
    },
  ]),
  'QUI ocupada por Outra QUI v1',
);

assert.equal(
  getRiskMatrixAvailabilityConflictMessage(
    {
      response: {
        data: {
          message: 'Já existe matriz customizada habilitada para essa coverage neste estabelecimento',
        },
      },
    },
  ),
  'Já existe matriz customizada habilitada para essa coverage neste estabelecimento',
);
assert.equal(
  getRiskMatrixAvailabilityConflictMessage(
    {
      response: {
        data: {
          message: 'Conflito',
          conflicts: [
            {
              coverageKey: RiskMatrixCoverageKeyEnum.QUI,
              existingMatrixId: 'other',
              existingMatrixName: 'Outra QUI',
              existingVersionId: 'other-v1',
              existingVersionNumber: 1,
            },
          ],
        },
      },
    },
  ),
  'Não foi possível alterar a disponibilidade. QUI ocupada por Outra QUI v1.',
);

console.log('risk-matrix-error.util.spec.ts OK');
