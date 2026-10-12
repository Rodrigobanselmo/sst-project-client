/**
 * Recortes da IA na aba Fatores de Riscos.
 *
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factors-ai-scope.util.spec.ts
 */
import assert from 'node:assert/strict';

import { removeModularSuggestion } from '../../../../../../modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';
import { buildGseAiAnalyzeRequestBody } from '../../../../../../modals/ModalAddGHO/components/build-gse-ai-analyze-request.util';

import {
  buildAiAnalyzeScopePayload,
  filterReviewsForRiskFactorAi,
  riskDataAlreadyContainsFieldValue,
  existingControlEmptyMessage,
  scopedAiEmptyMessage,
} from './risk-factors-ai-scope.util';

const review = (
  riskId: string,
  field:
    | 'generateSource'
    | 'probability'
    | 'recommendedEngineeringMeasures'
    | 'recommendedAdministrativeMeasures',
  value: string,
) => ({
  riskId,
  name: riskId,
  suggestions: [
    {
      field,
      currentValues: [] as string[],
      suggestedValues: [value],
      applyMode: 'append' as const,
    },
  ],
});

const noise = {
  riskId: 'risk-noise',
  name: 'Ruído',
  suggestions: [
    review('risk-noise', 'generateSource', 'Prensa').suggestions[0],
    review('risk-noise', 'probability', '5').suggestions[0],
    review('risk-noise', 'recommendedEngineeringMeasures', 'Enclausurar').suggestions[0],
    review('risk-noise', 'recommendedAdministrativeMeasures', 'Rodízio').suggestions[0],
  ],
};

assert.deepEqual(buildAiAnalyzeScopePayload({ scope: 'risk', riskId: 'risk-noise' }), {
  scope: 'risk',
  riskId: 'risk-noise',
});
assert.equal(
  'field' in buildAiAnalyzeScopePayload({ scope: 'risk', riskId: 'risk-noise' }),
  false,
);
assert.deepEqual(
  buildAiAnalyzeScopePayload({
    scope: 'field',
    riskId: 'risk-noise',
    field: 'recommendedEngineeringMeasures',
  }),
  {
    scope: 'field',
    riskId: 'risk-noise',
    field: 'medidasEngenhariaRecomendadas',
  },
);

const riskMode = filterReviewsForRiskFactorAi(
  [noise, review('risk-other', 'generateSource', 'Forno')],
  { scope: 'risk', riskId: 'risk-noise' },
);
assert.equal(riskMode.length, 1);
assert.deepEqual(
  riskMode[0].suggestions.map((item) => item.field),
  [
    'generateSource',
    'recommendedEngineeringMeasures',
    'recommendedAdministrativeMeasures',
  ],
);

const fieldMode = filterReviewsForRiskFactorAi([noise], {
  scope: 'field',
  riskId: 'risk-noise',
  field: 'generateSource',
});
assert.deepEqual(
  fieldMode[0].suggestions.map((item) => item.field),
  ['generateSource'],
);

const generalBody = buildGseAiAnalyzeRequestBody({
  userGuidance: '',
  temporaryDocumentSource: null,
});
assert.equal('scope' in generalBody, false);
assert.equal('riskId' in generalBody, false);

const fieldBody = buildGseAiAnalyzeRequestBody({
  userGuidance: '',
  temporaryDocumentSource: null,
  scope: 'field',
  riskId: 'risk-noise',
  field: 'fonteGeradora',
});
assert.equal(fieldBody.scope, 'field');
assert.equal(fieldBody.field, 'fonteGeradora');

const kept = removeModularSuggestion(
  [
    {
      ...noise,
      suggestions: [
        ...noise.suggestions,
      ],
    },
  ],
  'risk-noise:generateSource:prensa',
);
assert.equal(
  kept[0].suggestions.some((item) => item.field === 'generateSource'),
  false,
);
assert.equal(kept[0].suggestions.length, 3);

const emptied = removeModularSuggestion(
  [review('risk-noise', 'generateSource', 'Prensa')],
  'risk-noise:generateSource:prensa',
);
assert.deepEqual(emptied, []);

const registered = {
  generateSources: [{ name: 'Prensa hidráulica' }],
  engs: [{ medName: 'Enclausuramento' }],
  adms: [],
  recs: [{ recName: 'Manutenção periódica', recType: 'ENG' as const }],
};
assert.equal(
  riskDataAlreadyContainsFieldValue('generateSource', 'prensa hidraulica', registered),
  true,
);
assert.equal(
  riskDataAlreadyContainsFieldValue('generateSource', 'Serra', registered),
  false,
);
assert.equal(
  riskDataAlreadyContainsFieldValue(
    'recommendedAdministrativeMeasures',
    'Manutenção periódica',
    registered,
  ),
  false,
);
assert.equal(
  riskDataAlreadyContainsFieldValue(
    'recommendedEngineeringMeasures',
    'Manutenção periódica',
    registered,
  ),
  true,
);

assert.equal(
  scopedAiEmptyMessage('field'),
  'Não foram identificadas sugestões pertinentes para este campo.',
);
assert.equal(
  scopedAiEmptyMessage('risk'),
  'Não foram identificadas sugestões pertinentes para este fator de risco.',
);
assert.match(
  existingControlEmptyMessage('missing_generate_source'),
  /fonte geradora/i,
);
assert.match(existingControlEmptyMessage('insufficient_context'), /contexto suficiente/i);
assert.match(existingControlEmptyMessage('exhausted'), /já consideradas/i);
assert.equal(
  existingControlEmptyMessage(null),
  scopedAiEmptyMessage('field'),
);

console.log('risk-factors-ai-scope.util.spec: ok');
