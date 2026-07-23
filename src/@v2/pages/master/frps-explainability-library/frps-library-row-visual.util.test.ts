/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-library-row-visual.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FRPS_CANONICAL_CHIP_SX,
  FRPS_GLOBAL_ORIGIN_CHIP_SX,
} from './frps-explainability-library-ux.constants';
import {
  resolveFrpsLibraryExplanationChipProps,
  resolveFrpsLibraryOriginChipProps,
  resolveFrpsLibraryViewButtonVariant,
} from './frps-library-row-visual.util';
import { FRPS_INVALID_SYSTEM_REFERENCE_TOOLTIP } from './frps-library-unlink-canonical.util';

describe('FRPS library row visual (validated / origin chips)', () => {
  it('VALIDATED → Visualizar filled (same pattern as Gerar)', () => {
    assert.equal(resolveFrpsLibraryViewButtonVariant('VALIDATED'), 'contained');
  });

  it('DRAFT_AI → Visualizar outlined (current style)', () => {
    assert.equal(resolveFrpsLibraryViewButtonVariant('DRAFT_AI'), 'outlined');
  });

  it('other statuses keep Visualizar outlined', () => {
    assert.equal(
      resolveFrpsLibraryViewButtonVariant('NEVER_GENERATED'),
      'outlined',
    );
    assert.equal(resolveFrpsLibraryViewButtonVariant('REJECTED'), 'outlined');
  });

  it('GLOBAL → high-contrast orange/white chip (shared Canônico sx)', () => {
    const props = resolveFrpsLibraryOriginChipProps('GLOBAL');
    assert.ok('sx' in props);
    assert.equal(props.sx, FRPS_GLOBAL_ORIGIN_CHIP_SX);
    assert.equal(FRPS_GLOBAL_ORIGIN_CHIP_SX, FRPS_CANONICAL_CHIP_SX);
    const sx = FRPS_GLOBAL_ORIGIN_CHIP_SX as Record<string, unknown>;
    assert.equal(sx.bgcolor, 'primary.main');
    assert.equal(sx.color, 'primary.contrastText');
    assert.equal(sx.borderColor, 'primary.dark');
  });

  it('LOCAL → outlined default preserved', () => {
    assert.deepEqual(resolveFrpsLibraryOriginChipProps('LOCAL'), {
      color: 'default',
      variant: 'outlined',
    });
  });

  it('invalid system reference → warning chip + tooltip', () => {
    assert.deepEqual(
      resolveFrpsLibraryExplanationChipProps({
        isInvalidSystemReference: true,
        status: 'NEVER_GENERATED',
      }),
      {
        color: 'warning',
        variant: 'outlined',
        title: FRPS_INVALID_SYSTEM_REFERENCE_TOOLTIP,
      },
    );
  });
});
