import assert from 'node:assert/strict';

import { resolveCatalogOnlyAiSuggestionFeedback } from './resolve-catalog-only-ai-suggestion-feedback.util';

const emptyApi = resolveCatalogOnlyAiSuggestionFeedback({
  accepted: [],
  recognizedAlreadyLinked: [],
  apiReturnedNewCount: 0,
  apiReturnedAlreadyLinkedCount: 0,
  discardedInvalidCatalog: 0,
  discardedAlreadyLinkedFromNew: 0,
});
assert.ok(emptyApi);
assert.match(emptyApi.message, /sem fatores de risco pertinentes/i);
assert.match(emptyApi.message, /não implica/i);
assert.equal(emptyApi.variant, 'info');

const onlyLinked = resolveCatalogOnlyAiSuggestionFeedback({
  accepted: [],
  recognizedAlreadyLinked: [{ id: 'c' } as never],
  apiReturnedNewCount: 0,
  apiReturnedAlreadyLinkedCount: 1,
  discardedInvalidCatalog: 0,
  discardedAlreadyLinkedFromNew: 0,
});
assert.ok(onlyLinked);
assert.match(onlyLinked.message, /sem novos fatores/i);
assert.match(onlyLinked.message, /já vinculado/i);

const withImageFallback = resolveCatalogOnlyAiSuggestionFeedback(
  {
    accepted: [{ id: 'a' } as never],
    recognizedAlreadyLinked: [],
    apiReturnedNewCount: 1,
    apiReturnedAlreadyLinkedCount: 0,
    discardedInvalidCatalog: 0,
    discardedAlreadyLinkedFromNew: 0,
  },
  { imageFallbackApplied: true, imageFallbackTextOnly: true, selectedImageCount: 2 },
);
assert.ok(withImageFallback);
assert.match(withImageFallback.message, /apenas textual/i);

const mixed = resolveCatalogOnlyAiSuggestionFeedback({
  accepted: [{ id: 'a' } as never],
  recognizedAlreadyLinked: [{ id: 'c' } as never],
  apiReturnedNewCount: 1,
  apiReturnedAlreadyLinkedCount: 1,
  discardedInvalidCatalog: 0,
  discardedAlreadyLinkedFromNew: 0,
});
assert.ok(mixed);
assert.equal(mixed.variant, 'success');
assert.match(mixed.message, /oportunidade/i);

console.log('resolve-catalog-only-ai-suggestion-feedback.util.spec.ts OK');
