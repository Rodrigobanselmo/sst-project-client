/**
 * Executar: npx tsx --test src/@v2/services/forms/frps-explainability-library/service/frps-library-row-actions.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildFrpsLibraryRowKey,
  getFrpsLibraryRowActions,
  isFrpsInvalidSystemReference,
} from './frps-library-row-actions.util';

describe('getFrpsLibraryRowActions', () => {
  it('1 GLOBAL usable + NEVER_GENERATED → Gerar permitido', () => {
    assert.deepEqual(
      getFrpsLibraryRowActions({
        status: 'NEVER_GENERATED',
        conceptualExplanationId: null,
        generateable: true,
      }),
      {
        canGenerate: true,
        canView: false,
        canUnlinkFromCanonical: false,
      },
    );
  });

  it('2 GLOBAL inválido → Gerar oculto', () => {
    assert.deepEqual(
      getFrpsLibraryRowActions({
        status: 'NEVER_GENERATED',
        conceptualExplanationId: null,
        generateable: false,
      }),
      {
        canGenerate: false,
        canView: false,
        canUnlinkFromCanonical: false,
      },
    );
  });

  it('3 alias com equivalência ativa → Desvincular para MASTER', () => {
    assert.equal(
      getFrpsLibraryRowActions({
        status: 'NEVER_GENERATED',
        conceptualExplanationId: null,
        generateable: true,
        hasActiveEquivalence: true,
        isMaster: true,
      }).canUnlinkFromCanonical,
      true,
    );
  });

  it('4 não-MASTER → Desvincular oculto', () => {
    assert.equal(
      getFrpsLibraryRowActions({
        status: 'VALIDATED',
        conceptualExplanationId: 'exp-1',
        hasActiveEquivalence: true,
        isMaster: false,
      }).canUnlinkFromCanonical,
      false,
    );
  });

  it('DRAFT_AI and VALIDATED allow view without generate', () => {
    assert.deepEqual(getFrpsLibraryRowActions('DRAFT_AI', 'exp-1'), {
      canGenerate: false,
      canView: true,
      canUnlinkFromCanonical: false,
    });
    assert.deepEqual(getFrpsLibraryRowActions('VALIDATED', 'exp-2'), {
      canGenerate: false,
      canView: true,
      canUnlinkFromCanonical: false,
    });
  });

  it('REJECTED allows regenerate and view when id exists', () => {
    assert.deepEqual(getFrpsLibraryRowActions('REJECTED', 'exp-3'), {
      canGenerate: true,
      canView: true,
      canUnlinkFromCanonical: false,
    });
  });

  it('blocks view when explanation id is missing', () => {
    assert.deepEqual(getFrpsLibraryRowActions('DRAFT_AI', null), {
      canGenerate: false,
      canView: false,
      canUnlinkFromCanonical: false,
    });
    assert.deepEqual(getFrpsLibraryRowActions('REJECTED', null), {
      canGenerate: true,
      canView: false,
      canUnlinkFromCanonical: false,
    });
  });
});

describe('isFrpsInvalidSystemReference', () => {
  it('detects INVALID_SYSTEM_REFERENCE', () => {
    assert.equal(isFrpsInvalidSystemReference('INVALID_SYSTEM_REFERENCE'), true);
    assert.equal(isFrpsInvalidSystemReference('USABLE'), false);
    assert.equal(isFrpsInvalidSystemReference(undefined), false);
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
