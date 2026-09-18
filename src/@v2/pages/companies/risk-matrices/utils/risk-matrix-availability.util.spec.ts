/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-availability.util.spec.ts
 */
import assert from 'node:assert/strict';

import { RiskMatrixCoverageKeyEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import type { MatrixWorkspaceAvailabilityWorkspace } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { describeWorkspaceAvailability } from './risk-matrix-availability.util';

const base: MatrixWorkspaceAvailabilityWorkspace = {
  workspaceId: 'w1',
  workspaceName: 'Matriz',
  enabled: false,
  enabledVersionId: null,
  enabledVersionNumber: null,
  targetVersionId: 'v2',
  coverages: [RiskMatrixCoverageKeyEnum.QUI],
  conflicts: [],
  switchFrom: null,
  action: 'enable',
  canEnable: true,
  canDisable: false,
  canSwitch: false,
};

assert.equal(
  describeWorkspaceAvailability(base),
  'Livre para disponibilizar a versão completa.',
);
assert.equal(
  describeWorkspaceAvailability({
    ...base,
    enabled: true,
    enabledVersionId: 'v2',
    enabledVersionNumber: 2,
    action: 'disable',
    canEnable: false,
    canDisable: true,
  }),
  'Habilitada (v2)',
);
assert.equal(
  describeWorkspaceAvailability({
    ...base,
    enabled: true,
    enabledVersionId: 'v1',
    enabledVersionNumber: 1,
    action: 'switch',
    canEnable: false,
    canDisable: true,
    canSwitch: true,
    switchFrom: { versionId: 'v1', versionNumber: 1 },
  }),
  'Habilitada na v1. Há uma versão publicada mais recente.',
);
assert.equal(
  describeWorkspaceAvailability({
    ...base,
    action: 'blocked',
    canEnable: false,
    conflicts: [
      {
        coverageKey: RiskMatrixCoverageKeyEnum.QUI,
        existingMatrixId: 'other',
        existingMatrixName: 'Outra QUI',
        existingVersionId: 'other-v1',
        existingVersionNumber: 1,
      },
    ],
  }),
  'Coberturas ocupadas por outra matriz customizada.',
);

console.log('risk-matrix-availability.util.spec.ts OK');
