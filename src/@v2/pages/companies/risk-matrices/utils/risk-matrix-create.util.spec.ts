/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-create.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CompanyRiskMatrixVersionStatusEnum,
  RiskMatrixCreateSourceEnum,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { RISK_MATRIX_CREATE_SOURCE_HELP } from '../maps/risk-matrix.maps';
import { buildCreateRiskMatrixPayload } from './risk-matrix-create.util';
import { resolveCreatedRiskMatrixEditorPath } from './risk-matrix-paths.util';

assert.deepEqual(
  buildCreateRiskMatrixPayload({
    name: 'Matriz A',
    source: RiskMatrixCreateSourceEnum.BLANK,
  }),
  { name: 'Matriz A' },
);

assert.deepEqual(
  buildCreateRiskMatrixPayload({
    name: 'Matriz A',
    description: 'Opcional',
    source: RiskMatrixCreateSourceEnum.BLANK,
  }),
  { name: 'Matriz A', description: 'Opcional' },
);

assert.deepEqual(
  buildCreateRiskMatrixPayload({
    name: 'Matriz da empresa',
    source: RiskMatrixCreateSourceEnum.SYSTEM,
  }),
  {
    name: 'Matriz da empresa',
    source: RiskMatrixCreateSourceEnum.SYSTEM,
  },
);

assert.deepEqual(
  buildCreateRiskMatrixPayload({
    name: 'Matriz da empresa',
    description: 'Texto do usuário',
    source: RiskMatrixCreateSourceEnum.SYSTEM,
  }),
  {
    name: 'Matriz da empresa',
    description: 'Texto do usuário',
    source: RiskMatrixCreateSourceEnum.SYSTEM,
  },
);

assert.equal(
  JSON.stringify(
    buildCreateRiskMatrixPayload({
      name: 'Matriz da empresa',
      source: RiskMatrixCreateSourceEnum.SYSTEM,
    }),
  ).includes('somente leitura'),
  false,
);

assert.equal(
  resolveCreatedRiskMatrixEditorPath('company-1', {
    id: 'matrix-1',
    draftVersion: {
      id: 'draft-1',
      versionNumber: 1,
      status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
    },
  }),
  '/dashboard/empresas/company-1/matrizes-risco/matrix-1/versoes/draft-1',
);

const dialogSource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/RiskMatrixCreateDialog.tsx',
  'utf8',
);
assert.ok(dialogSource.includes('Em branco'));
assert.ok(dialogSource.includes('A partir do Padrão SimpleSST'));
assert.ok(dialogSource.includes('buildCreateRiskMatrixPayload'));
assert.ok(dialogSource.includes('RISK_MATRIX_CREATE_SOURCE_HELP'));
assert.equal(dialogSource.includes('v2/master/system-risk-matrix'), false);
assert.ok(RISK_MATRIX_CREATE_SOURCE_HELP.includes('cópia editável'));
assert.ok(RISK_MATRIX_CREATE_SOURCE_HELP.includes('permanece inalterado'));

const pageSource = readFileSync(
  'src/@v2/pages/master/system-risk-matrix/SystemRiskMatrixPage.tsx',
  'utf8',
);
assert.equal(pageSource.includes('Criar a partir do Padrão SimpleSST'), false);
assert.equal(pageSource.includes('useMutateCreateRiskMatrix'), false);

console.log('risk-matrix-create.util.spec.ts OK');
