/**
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddProbability/qualitative-probability.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  countSuggestionEffectAction,
  countSuggestionSignature,
  criteriaFromForm,
  qualitativeProbabilityFromCriteria,
  resolveCountSuggestion,
} from './qualitative-probability.util';

const dir = dirname(fileURLToPath(import.meta.url));

const saved = {
  employeeCountTotal: 100,
  employeeCountGho: 5,
  minDurationJT: 480,
  minDurationEO: 120,
  chancesOfHappening: 3,
  frequency: 3,
  history: 1,
  medsImplemented: 4,
};

const fromSaved = qualitativeProbabilityFromCriteria(saved);
assert.equal(fromSaved, 3);

const typed = criteriaFromForm({
  employeeCountTotal: '100',
  employeeCountGho: '5',
  minDurationJT: '480',
  minDurationEO: '120',
  chancesOfHappening: '3',
  frequency: '3',
  history: '1',
  medsImplemented: '4',
});
assert.deepEqual(typed, saved);
assert.equal(qualitativeProbabilityFromCriteria(typed), fromSaved);

const countSensitive = {
  employeeCountTotal: 100,
  employeeCountGho: 5,
  minDurationJT: null,
  minDurationEO: null,
  chancesOfHappening: null,
  frequency: 5,
  history: null,
  medsImplemented: null,
};
assert.equal(qualitativeProbabilityFromCriteria(countSensitive), 3);
assert.equal(
  qualitativeProbabilityFromCriteria({
    ...countSensitive,
    employeeCountTotal: 0,
    employeeCountGho: 0,
  }),
  5,
);

assert.equal(qualitativeProbabilityFromCriteria({}), null);

assert.equal(
  resolveCountSuggestion({
    adopted: null,
    adoptedProbability: 3,
    currentTotal: 80,
    currentGho: 40,
  }).kind,
  'none',
);

const drifted = resolveCountSuggestion({
  adopted: countSensitive,
  adoptedProbability: 3,
  currentTotal: 100,
  currentGho: 80,
});
assert.equal(drifted.kind, 'auto');
if (drifted.kind === 'auto') {
  assert.equal(drifted.probability, 5);
  assert.equal(drifted.criteria.employeeCountGho, 80);
  assert.equal(drifted.criteria.frequency, 5);
  assert.equal(drifted.criteria.medsImplemented, null);
}

const manual = resolveCountSuggestion({
  adopted: countSensitive,
  adoptedProbability: 1,
  currentTotal: 100,
  currentGho: 80,
});
assert.equal(manual.kind, 'hint');
if (manual.kind === 'hint') {
  assert.equal(manual.probability, 5);
  assert.equal(manual.criteria.employeeCountGho, 80);
  assert.equal(manual.criteria.frequency, countSensitive.frequency);
}

assert.equal(
  resolveCountSuggestion({
    adopted: saved,
    adoptedProbability: fromSaved,
    currentTotal: saved.employeeCountTotal,
    currentGho: saved.employeeCountGho,
  }).kind,
  'none',
);

assert.equal(
  resolveCountSuggestion({
    adopted: saved,
    adoptedProbability: fromSaved,
    currentTotal: 80,
    currentGho: 40,
    isQuantity: true,
  }).kind,
  'none',
);

assert.equal(countSuggestionEffectAction(null, drifted), 'baseline');
const signature = countSuggestionSignature(drifted);
assert.equal(countSuggestionEffectAction(signature, drifted), 'ignore');
assert.equal(
  countSuggestionEffectAction('none', drifted),
  'auto',
);
assert.equal(countSuggestionEffectAction(null, manual), 'baseline');
assert.equal(countSuggestionEffectAction('none', manual), 'ignore');

const hook = readFileSync(join(dir, 'hooks/useProbability.ts'), 'utf8');
assert.match(hook, /criteriaFromForm\(values\)/);
assert.doesNotMatch(hook, /probabilityData\.employeeCountGho/);
assert.doesNotMatch(hook, /useMutUpsertRiskData/);

const modal = readFileSync(join(dir, 'index.tsx'), 'utf8');
assert.doesNotMatch(modal, /useMutUpsertRiskData/);

const util = readFileSync(join(dir, 'qualitative-probability.util.ts'), 'utf8');
assert.doesNotMatch(util, /calculateSuggestedResidualProbability/);
assert.doesNotMatch(util, /1\.25/);

const suggestion = readFileSync(join(dir, 'RealProbabilityCountSuggestion.tsx'), 'utf8');
assert.match(suggestion, /Sugestão pela contagem atual/);
assert.match(suggestion, /action !== 'auto'/);
assert.doesNotMatch(suggestion, /calculateSuggestedResidualProbability/);

console.log('qualitative-probability.util.spec: ok');
