/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-catalog-equivalence-dialog.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildFrpsEquivalenceDialogInit,
  mergeFrpsEquivalenceSelectionAfterBatch,
} from './frps-catalog-equivalence-dialog.util';
import { resolveFrpsLibraryCanonicalLinkAction } from './frps-catalog-admin-equivalence.util';
import {
  FRPS_CHOOSE_OTHER_CANONICAL_ACTION_LABEL,
  FRPS_SEARCH_CANONICAL_ACTION_LABEL,
} from './frps-explainability-library-ux.constants';

describe('manual canonical selection UX', () => {
  it('1) alias without suggestion exposes Pesquisar canônico', () => {
    assert.equal(
      resolveFrpsLibraryCanonicalLinkAction({
        origin: 'LOCAL',
        hasActiveEquivalence: false,
        hintStatus: 'NONE',
      }),
      'SEARCH',
    );
    assert.equal(FRPS_SEARCH_CANONICAL_ACTION_LABEL, 'Pesquisar canônico');
  });

  it('2) row open initializes dialog with that alias search text', () => {
    const init = buildFrpsEquivalenceDialogInit({
      aliasLabel: 'Ajustar metas e prazos conforme a complexidade das tarefas',
      preferManualPicker: true,
      normalizeSearch: (value) => value.trim(),
    });
    assert.equal(init.pickerMode, 'manual');
    assert.equal(init.autoResolved, true);
    assert.equal(init.canonicalId, '');
    assert.equal(
      init.searchDraft,
      'Ajustar metas e prazos conforme a complexidade das tarefas',
    );
  });

  it('3) manual init does not auto-select a canonical', () => {
    const init = buildFrpsEquivalenceDialogInit({
      aliasLabel: 'Pausas cognitivas',
      preferManualPicker: true,
      normalizeSearch: (value) => value,
    });
    assert.equal(init.suggestionAccepted, false);
    assert.equal(init.canonicalId, '');
  });

  it('4) batch toolbar keeps auto mode so suggestion card can appear', () => {
    const init = buildFrpsEquivalenceDialogInit({
      aliasLabel: 'Pausas cognitivas',
      preferManualPicker: false,
      normalizeSearch: (value) => value,
    });
    assert.equal(init.pickerMode, 'auto');
    assert.equal(init.autoResolved, false);
  });

  it('5-6) cancel/close path leaves canonical unselected (init empty id)', () => {
    const init = buildFrpsEquivalenceDialogInit({
      aliasLabel: 'Alias',
      preferManualPicker: true,
      normalizeSearch: (value) => value,
    });
    assert.equal(init.canonicalId, '');
  });

  it('7) incorrect auto hint exposes Escolher outro canônico', () => {
    assert.equal(
      resolveFrpsLibraryCanonicalLinkAction({
        origin: 'LOCAL',
        hasActiveEquivalence: false,
        hintStatus: 'EXACT_MATCH',
      }),
      'CHOOSE_OTHER',
    );
    assert.equal(
      resolveFrpsLibraryCanonicalLinkAction({
        origin: 'LOCAL',
        hasActiveEquivalence: false,
        hintStatus: 'POSSIBLE_CANDIDATES',
      }),
      'CHOOSE_OTHER',
    );
    assert.equal(
      FRPS_CHOOSE_OTHER_CANONICAL_ACTION_LABEL,
      'Escolher outro canônico',
    );
  });

  it('8-9) linked or global items do not offer link action', () => {
    assert.equal(
      resolveFrpsLibraryCanonicalLinkAction({
        origin: 'LOCAL',
        hasActiveEquivalence: true,
        hintStatus: 'NONE',
      }),
      null,
    );
    assert.equal(
      resolveFrpsLibraryCanonicalLinkAction({
        origin: 'GLOBAL',
        hasActiveEquivalence: false,
        hintStatus: 'NONE',
      }),
      null,
    );
  });

  it('10-11) batch success clears only attempted aliases; keeps outside selection', () => {
    const next = mergeFrpsEquivalenceSelectionAfterBatch({
      previousSelected: [
        { id: 'outside-1' },
        { id: 'attempted-1' },
        { id: 'attempted-2' },
      ],
      attemptedAliasIds: new Set(['attempted-1', 'attempted-2']),
      failedAliases: [{ id: 'attempted-2' }],
    });
    assert.deepEqual(
      next.map((item) => item.id),
      ['outside-1', 'attempted-2'],
    );
  });

  it('12) no automatic equivalence — manual init never preselects canonical', () => {
    const init = buildFrpsEquivalenceDialogInit({
      aliasLabel: 'Qualquer alias',
      preferManualPicker: true,
      normalizeSearch: (value) => value,
    });
    assert.equal(init.canonicalId, '');
    assert.equal(init.suggestionAccepted, false);
  });
});
