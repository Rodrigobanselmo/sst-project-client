import assert from 'node:assert/strict';
import {
  resolveProbabilityAiResult,
  PROBABILITY_AI_MESSAGES,
  isProbabilityOccurrenceRejection,
} from './probability-ai-result.util';

const base = {
  eligible: true,
  pendingCount: 0,
  riskId: 'risk',
  riskFactorDataId: 'row',
  currentProbability: 2,
  reviews: [],
  appliedKeys: new Set<string>(),
  dismissedKeys: new Set<string>(),
};
assert.equal(
  resolveProbabilityAiResult({
    ...base,
    metadata: { status: 'suggested', value: 4 },
    pendingCount: 1,
  }),
  'pending',
);
assert.equal(
  resolveProbabilityAiResult({
    ...base,
    metadata: { status: 'unchanged', value: 2 },
  }),
  'unchanged',
);
for (const metadata of [
  undefined,
  null,
  {},
  { status: 'unavailable' },
  { status: 'suggested', value: 'invalid' },
  { status: 'unchanged', value: 2.5 },
]) {
  assert.equal(
    resolveProbabilityAiResult({ ...base, metadata }),
    'unavailable',
  );
}
// A resposta vazia da análise atual não é disfarçada por pendências antigas.
assert.equal(
  resolveProbabilityAiResult({
    ...base,
    metadata: { status: 'unavailable' },
    pendingCount: 1,
  }),
  'unavailable',
);
for (const [keys, outcome] of [
  ['appliedKeys', 'applied'],
  ['dismissedKeys', 'dismissed'],
] as const) {
  assert.equal(
    resolveProbabilityAiResult({
      ...base,
      metadata: { status: 'suggested', value: 4 },
      [keys]: new Set(['risk:probability:4']),
    }),
    outcome,
  );
  assert.equal(
    resolveProbabilityAiResult({
      ...base,
      metadata: { status: 'unchanged', value: 2 },
      [keys]: new Set(['risk:probability:2']),
    }),
    outcome,
  );
  // Um histórico sem valor retornado não permite inventar o motivo da ausência.
  assert.equal(
    resolveProbabilityAiResult({
      ...base,
      [keys]: new Set(['risk:probability:4']),
    }),
    'unavailable',
  );
}
assert.equal(
  resolveProbabilityAiResult({ ...base, eligible: false, pendingCount: 1 }),
  'ineligible',
);
assert.equal(
  resolveProbabilityAiResult({ ...base, metadata: { status: 'ineligible' } }),
  'ineligible',
);
const review = {
  riskId: 'risk',
  riskFactorDataId: 'row',
  name: 'Risco',
  suggestions: [
    {
      field: 'probability' as const,
      suggestedValues: 4,
      applyMode: 'replace-scalar' as const,
    },
  ],
};
// Retrocompatibilidade: uma resposta sem metadados ainda usa revisões válidas.
assert.equal(
  resolveProbabilityAiResult({ ...base, reviews: [review], pendingCount: 1 }),
  'pending',
);
assert.equal(
  resolveProbabilityAiResult({
    ...base,
    reviews: [{ ...review, riskFactorDataId: 'other' }],
  }),
  'unavailable',
);
assert.equal(
  resolveProbabilityAiResult({
    ...base,
    reviews: [{ ...review, riskId: 'other' }],
  }),
  'unavailable',
);
assert.equal(
  resolveProbabilityAiResult({
    ...base,
    reviews: [review],
    appliedKeys: new Set(['risk:probability:4']),
  }),
  'applied',
);
assert.equal(
  resolveProbabilityAiResult({
    ...base,
    currentProbability: 4,
    reviews: [review],
  }),
  'unchanged',
);
assert.ok(
  PROBABILITY_AI_MESSAGES.unchanged.includes(
    'não representa validação técnica',
  ),
);
for (const code of [
  'HISTORICAL_OCCURRENCE',
  'INHERITED_OCCURRENCE',
  'AMBIGUOUS_OCCURRENCE',
]) {
  assert.equal(
    isProbabilityOccurrenceRejection({
      response: { status: 422, data: { code } },
    }),
    true,
  );
}
assert.equal(
  isProbabilityOccurrenceRejection({
    response: { status: 403, data: { code: 'EDIT_NOT_AUTHORIZED' } },
  }),
  true,
);
for (const error of [
  new Error('Falha da IA'),
  { response: { status: 500 } },
  { response: { status: 422, data: { code: 'MODEL_ERROR' } } },
]) {
  assert.equal(isProbabilityOccurrenceRejection(error), false);
}
console.log(
  'probability-ai-result: resultados, histórico, elegibilidade e identidade OK',
);
