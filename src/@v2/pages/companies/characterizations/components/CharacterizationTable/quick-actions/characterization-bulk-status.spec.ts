/**
 * Contrato — alteração em massa de status operacional.
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-bulk-status.spec.ts
 */
import assert from 'node:assert/strict';

import {
  buildActivateConfirmMessage,
  buildCharacterizationBulkStatusPath,
  buildCharacterizationBulkStatusPayload,
  buildInactivateConfirmMessage,
  CHARACTERIZATION_BULK_STATUS_TEXTS,
  countBrowseStatusTargets,
} from './characterization-bulk-status.util';
import { CharacterizationColumnMap } from '../../../../../../components/organisms/STable/implementation/SCharacterizationTable/maps/characterization-column-map';
import { CharacterizationColumnsEnum } from '../../../../../../components/organisms/STable/implementation/SCharacterizationTable/enums/characterization-columns.enum';

assert.equal(
  buildCharacterizationBulkStatusPath('co-1', 'ws-1'),
  '/company/co-1/workspace/ws-1/characterizations/bulk-status',
);

assert.deepEqual(
  buildCharacterizationBulkStatusPayload({
    characterizationIds: ['a'],
    status: 'INACTIVE',
    confirm: false,
  }),
  { characterizationIds: ['a'], status: 'INACTIVE', confirm: false },
);

assert.deepEqual(
  buildCharacterizationBulkStatusPayload({
    characterizationIds: ['a', 'b'],
    status: 'ACTIVE',
    confirm: true,
  }),
  { characterizationIds: ['a', 'b'], status: 'ACTIVE', confirm: true },
);

assert.equal(
  CharacterizationColumnMap[CharacterizationColumnsEnum.STAGE].label,
  'Etapa',
);

assert.equal(
  CHARACTERIZATION_BULK_STATUS_TEXTS.activate.confirm,
  'Ativar',
);
assert.equal(
  CHARACTERIZATION_BULK_STATUS_TEXTS.inactivate.confirm,
  'Inativar',
);

const activateMsg = buildActivateConfirmMessage({
  willUpdate: 4,
  alreadyActive: 2,
});
assert.ok(activateMsg.includes('4 elementos'));
assert.ok(activateMsg.includes('2 elementos já estão ativos'));

const inactivateMsg = buildInactivateConfirmMessage({
  willUpdate: 22,
  alreadyInactive: 5,
  blocked: 3,
});
assert.ok(inactivateMsg.includes('22 serão inativados'));
assert.ok(inactivateMsg.includes('5 já estão inativos'));
assert.ok(inactivateMsg.includes('3 não podem ser inativados'));
assert.ok(inactivateMsg.includes('não remove vínculos'));

assert.deepEqual(
  countBrowseStatusTargets(
    [
      { isInactive: true },
      { isInactive: false },
      { status: 'INACTIVE' },
      { status: 'ACTIVE' },
    ],
    'ACTIVE',
  ),
  { alreadyInTarget: 2, willChange: 2 },
);

assert.deepEqual(
  countBrowseStatusTargets(
    [{ isInactive: false }, { isInactive: true }],
    'INACTIVE',
  ),
  { alreadyInTarget: 1, willChange: 1 },
);

console.log('characterization-bulk-status.spec.ts: OK');
