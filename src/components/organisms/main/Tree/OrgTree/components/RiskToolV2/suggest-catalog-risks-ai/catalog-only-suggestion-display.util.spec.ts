import assert from 'node:assert/strict';

import {
  resolveCatalogOnlyConsiderationLabel,
  resolveCatalogOnlyOriginLabel,
  shouldWarnCatalogOnlyConsideration,
} from './catalog-only-suggestion-display.util';

assert.equal(resolveCatalogOnlyOriginLabel('AI_SUGGESTED'), 'Sugestão da IA');
assert.equal(resolveCatalogOnlyOriginLabel('USER_REQUESTED'), 'Solicitado por você');
assert.equal(resolveCatalogOnlyOriginLabel(undefined), 'Sugestão da IA');

assert.equal(
  resolveCatalogOnlyConsiderationLabel('PERTINENCE_IDENTIFIED'),
  'Pertinência identificada',
);
assert.equal(
  resolveCatalogOnlyConsiderationLabel('PERTINENCE_NOT_DEMONSTRATED'),
  'Pertinência não demonstrada',
);
assert.equal(
  resolveCatalogOnlyConsiderationLabel('INCONCLUSIVE'),
  'Avaliação inconclusiva',
);
assert.equal(resolveCatalogOnlyConsiderationLabel(undefined), null);

assert.equal(
  shouldWarnCatalogOnlyConsideration({
    suggestionOrigin: 'USER_REQUESTED',
    technicalConsideration: 'INCONCLUSIVE',
  }),
  true,
);
assert.equal(
  shouldWarnCatalogOnlyConsideration({
    suggestionOrigin: 'AI_SUGGESTED',
    technicalConsideration: 'INCONCLUSIVE',
  }),
  false,
);

console.log('catalog-only-suggestion-display.util.spec.ts OK');
