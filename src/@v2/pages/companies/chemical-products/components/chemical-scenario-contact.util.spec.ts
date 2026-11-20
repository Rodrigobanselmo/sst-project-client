import assert from 'node:assert/strict';
import { restoreScenarioContacts } from './chemical-scenario-contact.util';
import {
  buildCreateChemicalUseScenarioPayload,
  buildUpdateChemicalUseScenarioPayload,
  emptyChemicalUseScenarioFormValues,
} from './chemical-use-scenario-form.util';
import type {
  ChemicalUseScenarioBoardRow,
  ChemicalProductListItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

const legacy = { ratings: { contact: 5 as const }, confirmed: true };
const analysis = {
  rows: [
    { id: 'one', contactScore: 2, contactScoreRevision: 1 },
    { id: 'two', contactScore: null, contactScoreRevision: 2 },
    { id: 'legacy', contactScoreRevision: 0 },
  ] as ChemicalUseScenarioBoardRow[],
  ratingReviews: { one: legacy, two: legacy, legacy },
  reviewed: true,
};
const restored = restoreScenarioContacts(analysis);
assert.equal(restored.ratingReviews.one.ratings.contact, 2);
assert.equal(restored.ratingReviews.one.confirmed, true);
assert.equal(restored.ratingReviews.two.ratings.contact, undefined);
assert.equal(restored.ratingReviews.two.confirmed, false);
assert.deepEqual(restored.ratingReviews.legacy, legacy);
assert.equal(restored.reviewed, false);
assert.equal(analysis.ratingReviews.one.ratings.contact, 5);

const values = {
  ...emptyChemicalUseScenarioFormValues(),
  product: { id: 'product', status: 'ACTIVE' } as ChemicalProductListItem,
  activityName: 'Limpeza',
  contactScore: '4',
};
const created = buildCreateChemicalUseScenarioPayload(values);
assert(created.ok);
assert.equal(created.body.contactScore, 4);
const updated = buildUpdateChemicalUseScenarioPayload({
  ...values,
  initialContactScore: '2',
  contactScoreRevision: 7,
});
assert(updated.ok);
assert.equal(updated.body.contactScore, 4);
assert.equal(updated.body.expectedContactScoreRevision, 7);
const untouched = buildUpdateChemicalUseScenarioPayload({
  ...values,
  initialContactScore: '4',
  contactScoreRevision: 7,
});
assert(untouched.ok);
assert(!('contactScore' in untouched.body));
const cleared = buildUpdateChemicalUseScenarioPayload({
  ...values,
  contactScore: '',
  initialContactScore: '4',
  contactScoreRevision: 7,
});
assert(cleared.ok);
assert.equal(cleared.body.contactScore, null);
for (const invalid of ['0', '6', '1.5', 'NaN'])
  assert.equal(
    buildCreateChemicalUseScenarioPayload({ ...values, contactScore: invalid })
      .ok,
    false,
  );
console.log('chemical-scenario-contact.util.spec.ts: OK');
