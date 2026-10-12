/**
 * Deduplicação e reconhecimento de medidas já aplicadas nas sugestões de IA.
 * Vale para GSE e Elementos Caracterizados, que compartilham estas funções.
 *
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util.spec.ts
 */
import assert from 'node:assert/strict';

import { riskDataAlreadyContainsFieldValue } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factors-ai-scope.util';

import type {
  AiRiskFieldSuggestion,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import {
  buildModularSuggestionKey,
  isEquivalentApplyInFlight,
  listUniqueReviewSuggestionValues,
  mergeExistingRiskReviews,
  normalizeSuggestionText,
  removeModularSuggestion,
} from './ai-risk-field-suggestion.util';

const RISK = 'risk-postura';
const OTHER_RISK = 'risk-outro';
const PLAIN = 'Rodízio de atividades entre supervisores';
const ONE_DOT = 'Rodízio de atividades entre supervisores.';
const TWO_DOTS = 'Rodízio de atividades entre supervisores..';
const OTHER = 'Pausas programadas para descanso';

function suggestion(
  value: string,
  rationale: string,
  field: AiRiskFieldSuggestion['field'] = 'existingAdministrativeMeasures',
): AiRiskFieldSuggestion {
  return {
    field,
    suggestedValues: [value],
    rationale,
    applyMode: 'append',
    intent: 'verificar',
  };
}

function review(
  suggestions: AiRiskFieldSuggestion[],
  riskId = RISK,
): ExistingRiskReview {
  return {
    riskId,
    riskFactorDataId: 'rfd-1',
    name: 'Postura',
    suggestions,
  };
}

assert.equal(normalizeSuggestionText(PLAIN), normalizeSuggestionText(ONE_DOT));
assert.equal(normalizeSuggestionText(PLAIN), normalizeSuggestionText(TWO_DOTS));
assert.equal(normalizeSuggestionText(`  ${PLAIN.toUpperCase()}.  `), normalizeSuggestionText(PLAIN));
assert.notEqual(normalizeSuggestionText(PLAIN), normalizeSuggestionText(OTHER));

const sharedKey = buildModularSuggestionKey(RISK, 'existingAdministrativeMeasures', PLAIN);
assert.equal(buildModularSuggestionKey(RISK, 'existingAdministrativeMeasures', ONE_DOT), sharedKey);
assert.equal(buildModularSuggestionKey(RISK, 'existingAdministrativeMeasures', TWO_DOTS), sharedKey);
assert.notEqual(
  buildModularSuggestionKey(OTHER_RISK, 'existingAdministrativeMeasures', PLAIN),
  sharedKey,
);
assert.notEqual(
  buildModularSuggestionKey(RISK, 'existingEngineeringMeasures', PLAIN),
  sharedKey,
);

const stored = review([
  suggestion(PLAIN, 'Orientação da primeira análise'),
  suggestion(ONE_DOT, 'Orientação da segunda análise'),
  suggestion(TWO_DOTS, 'Orientação da terceira análise'),
  suggestion(OTHER, 'Medida diferente'),
]);
const before = JSON.stringify(stored);
const visible = listUniqueReviewSuggestionValues(stored, stored.suggestions);
assert.equal(visible.length, 2);
assert.equal(visible[0]?.value, PLAIN);
assert.equal(visible[0]?.suggestion.rationale, 'Orientação da primeira análise');
assert.equal(visible[0]?.key, sharedKey);
assert.equal(visible[1]?.value, OTHER);
assert.equal(JSON.stringify(stored), before);

const successive = mergeExistingRiskReviews({
  existing: [review([suggestion(PLAIN, 'Primeira')])],
  incoming: [review([suggestion(TWO_DOTS, 'Segunda')])],
});
assert.equal(successive.length, 1);
assert.equal(successive[0]?.suggestions.length, 1);
assert.equal(successive[0]?.suggestions[0]?.rationale, 'Primeira');

const historical = review([
  suggestion(PLAIN, 'A'),
  suggestion(ONE_DOT, 'B'),
  suggestion(TWO_DOTS, 'C'),
]);
const kept = mergeExistingRiskReviews({
  existing: [historical],
  incoming: [review([suggestion(`${PLAIN}.`, 'D')])],
});
assert.equal(kept[0]?.suggestions.length, 3);
assert.equal(listUniqueReviewSuggestionValues(kept[0]!, kept[0]!.suggestions).length, 1);
assert.equal(historical.suggestions.length, 3);

const linked = riskDataAlreadyContainsFieldValue(
  'existingAdministrativeMeasures',
  PLAIN,
  { adms: [{ medName: null, recName: TWO_DOTS }] },
);
assert.equal(linked, true);

const blocked = riskDataAlreadyContainsFieldValue(
  'existingAdministrativeMeasures',
  PLAIN,
  {
    adms: [],
    recs: [{ recName: TWO_DOTS, medName: null, recType: 'ADM' }],
  },
);
assert.equal(blocked, false);

const engineering = riskDataAlreadyContainsFieldValue(
  'existingEngineeringMeasures',
  'Guarda-corpo',
  { engs: [{ medName: 'Guarda-corpo.', recName: null }] },
);
assert.equal(engineering, true);

assert.equal(isEquivalentApplyInFlight(sharedKey, sharedKey), true);
assert.equal(
  isEquivalentApplyInFlight(
    sharedKey,
    buildModularSuggestionKey(RISK, 'existingAdministrativeMeasures', OTHER),
  ),
  false,
);
assert.equal(isEquivalentApplyInFlight(null, sharedKey), false);

const discarded = removeModularSuggestion([stored], sharedKey);
const remaining = discarded.flatMap((item) =>
  listUniqueReviewSuggestionValues(item, item.suggestions).map((entry) => entry.value),
);
assert.deepEqual(remaining, [OTHER]);

console.log('ai-risk-field-suggestion.util.spec: ok');
