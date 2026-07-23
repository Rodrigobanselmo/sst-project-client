/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-library-unlink-canonical.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FRPS_INVALID_SYSTEM_REFERENCE_CHIP_LABEL,
  FRPS_UNLINK_DEFAULT_REVOKE_REASON,
  buildFrpsUnlinkImpactCopy,
  canShowFrpsUnlinkFromCanonical,
  isFrpsUnlinkRevokeReasonValid,
} from './frps-library-unlink-canonical.util';

describe('canShowFrpsUnlinkFromCanonical', () => {
  it('3 alias com equivalência → visível para MASTER', () => {
    assert.equal(
      canShowFrpsUnlinkFromCanonical({
        isMaster: true,
        hasActiveEquivalence: true,
      }),
      true,
    );
  });

  it('4 não-MASTER → oculto', () => {
    assert.equal(
      canShowFrpsUnlinkFromCanonical({
        isMaster: false,
        hasActiveEquivalence: true,
      }),
      false,
    );
  });

  it('sem equivalência → oculto', () => {
    assert.equal(
      canShowFrpsUnlinkFromCanonical({
        isMaster: true,
        hasActiveEquivalence: false,
      }),
      false,
    );
  });
});

describe('isFrpsUnlinkRevokeReasonValid', () => {
  it('6 motivo vazio bloqueia', () => {
    assert.equal(isFrpsUnlinkRevokeReasonValid(''), false);
    assert.equal(isFrpsUnlinkRevokeReasonValid('   '), false);
  });

  it('motivo preenchido libera', () => {
    assert.equal(
      isFrpsUnlinkRevokeReasonValid(FRPS_UNLINK_DEFAULT_REVOKE_REASON),
      true,
    );
  });
});

describe('buildFrpsUnlinkImpactCopy', () => {
  it('9 GLOBAL: volta identidade própria', () => {
    const copy = buildFrpsUnlinkImpactCopy({ origin: 'GLOBAL' });
    assert.match(copy.originSpecific, /identidade conceitual/i);
  });

  it('10 LOCAL: fica sem canônico', () => {
    const copy = buildFrpsUnlinkImpactCopy({ origin: 'LOCAL' });
    assert.match(copy.originSpecific, /sem canônico/i);
  });
});

describe('invalid reference labels', () => {
  it('chip label is distinct from Nunca gerado', () => {
    assert.equal(
      FRPS_INVALID_SYSTEM_REFERENCE_CHIP_LABEL,
      'Referência global inválida',
    );
    assert.notEqual(FRPS_INVALID_SYSTEM_REFERENCE_CHIP_LABEL, 'Nunca gerado');
  });
});
