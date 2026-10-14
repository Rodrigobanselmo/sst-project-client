import assert from 'node:assert/strict';

import { resolveCatalogOnlyAiSuggestionFeedback } from './resolve-catalog-only-ai-suggestion-feedback.util';

const emptyApi = resolveCatalogOnlyAiSuggestionFeedback({
  accepted: [],
  apiReturnedCount: 0,
  discardedInvalidCatalog: 0,
  discardedAlreadyLinked: 0,
});
assert.ok(emptyApi);
assert.match(emptyApi.message, /não retornou sugestões/i);
assert.equal(emptyApi.variant, 'info');

const allDiscarded = resolveCatalogOnlyAiSuggestionFeedback({
  accepted: [],
  apiReturnedCount: 3,
  discardedInvalidCatalog: 2,
  discardedAlreadyLinked: 1,
});
assert.ok(allDiscarded);
assert.match(allDiscarded.message, /não está disponível|fora do catálogo/i);
assert.equal(allDiscarded.variant, 'warning');

const partial = resolveCatalogOnlyAiSuggestionFeedback({
  accepted: [{ id: 'a' } as never],
  apiReturnedCount: 2,
  discardedInvalidCatalog: 1,
  discardedAlreadyLinked: 0,
});
assert.ok(partial);
assert.match(partial.message, /disponível/i);
assert.match(partial.message, /descartadas/i);

const allValid = resolveCatalogOnlyAiSuggestionFeedback({
  accepted: [{ id: 'a' } as never],
  apiReturnedCount: 1,
  discardedInvalidCatalog: 0,
  discardedAlreadyLinked: 0,
});
assert.equal(allValid, null);

console.log('resolve-catalog-only-ai-suggestion-feedback.util.spec.ts OK');
