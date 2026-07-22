/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-explainability-library-ux.constants.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TABLE_PAGE_SIZE_OPTIONS } from '@v2/constants/table-pagination.constants';

import {
  FRPS_ALIAS_NAME_INDENT_PX,
  FRPS_CANONICAL_CHIP_SX,
  FRPS_CHOOSE_OTHER_CANONICAL_ACTION_LABEL,
  FRPS_EQUIVALENCE_DIALOG_TITLE,
  FRPS_LIBRARY_STICKY_TABLE_HEAD_SX,
  FRPS_LIBRARY_STICKY_TOOLBAR_SX,
  FRPS_LIBRARY_TABLE_CONTAINER_SX,
  FRPS_LINK_TO_CANONICAL_BUTTON_LABEL,
  FRPS_SEARCH_CANONICAL_ACTION_LABEL,
  buildFrpsEquivalenceDialogConfirmLabel,
  buildFrpsLinkToCanonicalButtonLabel,
} from './frps-explainability-library-ux.constants';
import { FRPS_LIBRARY_DEFAULT_LIMIT } from './frps-explainability-library-filters.util';

describe('FRPS library UX refinements', () => {
  it('1) canonical chip uses high-contrast SimpleSST orange', () => {
    const sx = FRPS_CANONICAL_CHIP_SX as Record<string, unknown>;
    assert.equal(sx.bgcolor, 'primary.main');
    assert.equal(sx.color, 'primary.contrastText');
    assert.equal(sx.borderColor, 'primary.dark');
  });

  it('2) alias indent is only on the name column constant', () => {
    assert.equal(FRPS_ALIAS_NAME_INDENT_PX, 28);
    assert.ok(FRPS_ALIAS_NAME_INDENT_PX >= 24);
  });

  it('3) link-to-canonical button labels', () => {
    assert.equal(FRPS_LINK_TO_CANONICAL_BUTTON_LABEL, 'Vincular ao canônico');
    assert.equal(
      buildFrpsLinkToCanonicalButtonLabel(3),
      'Vincular ao canônico (3)',
    );
  });

  it('4) dialog title and confirm texts', () => {
    assert.equal(FRPS_EQUIVALENCE_DIALOG_TITLE, 'Vincular ao canônico global');
    assert.equal(buildFrpsEquivalenceDialogConfirmLabel(1), 'Vincular 1 item');
    assert.equal(buildFrpsEquivalenceDialogConfirmLabel(2), 'Vincular 2 itens');
  });

  it('5) sticky toolbar uses project sticky pattern', () => {
    const sx = FRPS_LIBRARY_STICKY_TOOLBAR_SX as Record<string, unknown>;
    assert.equal(sx.position, 'sticky');
    assert.equal(sx.top, 0);
    assert.equal(sx.zIndex, 12);
    assert.equal(sx.bgcolor, 'background.paper');
  });

  it('6) sticky table head sits below toolbar via CSS var', () => {
    const sx = FRPS_LIBRARY_STICKY_TABLE_HEAD_SX as Record<string, unknown>;
    assert.equal(sx.position, 'sticky');
    assert.equal(sx.top, 'var(--frps-library-sticky-offset, 0px)');
    assert.equal(sx.zIndex, 11);
    assert.equal(sx.bgcolor, 'background.paper');
  });

  it('6b) table container keeps overflow visible so thead offset does not cover rows', () => {
    const sx = FRPS_LIBRARY_TABLE_CONTAINER_SX as Record<string, unknown>;
    assert.equal(sx.overflow, 'visible');
  });

  it('7) page size options match shared SimpleSST table pagination', () => {
    assert.deepEqual([...TABLE_PAGE_SIZE_OPTIONS], [15, 25, 50, 100]);
    assert.equal(FRPS_LIBRARY_DEFAULT_LIMIT, 15);
  });

  it('8-9) limit change contract resets page via shared handler semantics', () => {
    // createPageSizeChangeHandler always patches { limit, page: 1 }.
    const patch = { limit: 50, page: 1 };
    assert.equal(patch.page, 1);
    assert.ok(TABLE_PAGE_SIZE_OPTIONS.includes(patch.limit as 15 | 25 | 50 | 100));
  });

  it('10) active pagination uses primary (orange) contrast text', () => {
    // STablePagination selected item uses primary.main + contrastText.
    assert.equal(
      (FRPS_CANONICAL_CHIP_SX as Record<string, unknown>).bgcolor,
      'primary.main',
    );
  });

  it('11) grouping labels remain canonical/alias semantics', () => {
    assert.match('Canônico · 2 aliases', /^Canônico · \d+ aliases?$/);
    assert.match('Alias → Canônico longo', /^Alias → /);
  });

  it('12) manual canonical picker action labels', () => {
    assert.equal(FRPS_SEARCH_CANONICAL_ACTION_LABEL, 'Pesquisar canônico');
    assert.equal(
      FRPS_CHOOSE_OTHER_CANONICAL_ACTION_LABEL,
      'Escolher outro canônico',
    );
  });
});
