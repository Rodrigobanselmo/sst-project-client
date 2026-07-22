/**
 * Executar: npx tsx --test src/@v2/services/forms/frps-explainability-library/service/frps-library-row-actions.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildFrpsLibraryRowKey,
  getFrpsLibraryRowActions,
} from './frps-library-row-actions.util';

describe('getFrpsLibraryRowActions', () => {
  it('NEVER_GENERATED allows generate and blocks view', () => {
    assert.deepEqual(getFrpsLibraryRowActions('NEVER_GENERATED', null), {
      canGenerate: true,
      canView: false,
    });
  });

  it('DRAFT_AI and VALIDATED allow view without generate', () => {
    assert.deepEqual(getFrpsLibraryRowActions('DRAFT_AI', 'exp-1'), {
      canGenerate: false,
      canView: true,
    });
    assert.deepEqual(getFrpsLibraryRowActions('VALIDATED', 'exp-2'), {
      canGenerate: false,
      canView: true,
    });
  });

  it('REJECTED allows regenerate and view when id exists', () => {
    assert.deepEqual(getFrpsLibraryRowActions('REJECTED', 'exp-3'), {
      canGenerate: true,
      canView: true,
    });
  });

  it('blocks view when explanation id is missing', () => {
    assert.deepEqual(getFrpsLibraryRowActions('DRAFT_AI', null), {
      canGenerate: false,
      canView: false,
    });
    assert.deepEqual(getFrpsLibraryRowActions('REJECTED', null), {
      canGenerate: true,
      canView: false,
    });
  });
});

describe('buildFrpsLibraryRowKey', () => {
  it('composes itemType and systemCatalogId', () => {
    assert.equal(
      buildFrpsLibraryRowKey('SOURCE', 'gs-1'),
      'SOURCE:gs-1',
    );
  });
});
