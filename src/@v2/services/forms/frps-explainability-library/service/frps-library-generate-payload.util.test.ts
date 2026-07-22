/**
 * Executar: npx tsx --test src/@v2/services/forms/frps-explainability-library/service/frps-library-generate-payload.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildFrpsLibraryGeneratePayload } from './frps-library-generate-payload.util';

describe('buildFrpsLibraryGeneratePayload', () => {
  it('sends only system identity fields for generation', () => {
    assert.deepEqual(
      buildFrpsLibraryGeneratePayload({
        systemCatalogId: 'gs-1',
        itemType: 'SOURCE',
      }),
      {
        systemCatalogId: 'gs-1',
        itemType: 'SOURCE',
      },
    );
  });

  it('includes optional conceptualModel when provided', () => {
    assert.deepEqual(
      buildFrpsLibraryGeneratePayload({
        systemCatalogId: 'rec-1',
        itemType: 'ENGINEERING_RECOMMENDATION',
        conceptualModel: 'gpt-test',
      }),
      {
        systemCatalogId: 'rec-1',
        itemType: 'ENGINEERING_RECOMMENDATION',
        conceptualModel: 'gpt-test',
      },
    );
  });

  it('does not include name or fuzzy identity fields', () => {
    const payload = buildFrpsLibraryGeneratePayload({
      systemCatalogId: 'gs-2',
      itemType: 'ADMINISTRATIVE_RECOMMENDATION',
    });

    assert.equal('name' in payload, false);
    assert.equal('itemKey' in payload, false);
    assert.equal('itemName' in payload, false);
    assert.equal('catalogId' in payload, false);
  });
});
