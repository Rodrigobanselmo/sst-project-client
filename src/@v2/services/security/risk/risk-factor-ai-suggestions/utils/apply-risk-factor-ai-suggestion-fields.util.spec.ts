/**
 * Executar: npx tsx src/@v2/services/security/risk/risk-factor-ai-suggestions/utils/apply-risk-factor-ai-suggestion-fields.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT } from '@v2/constants/risk-factor-chemical-ai-suggestions-default-prompt.constant';
import {
  RISK_FACTOR_ACCIDENT_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_BIOLOGICAL_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_ERGONOMIC_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_OTHER_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_PHYSICAL_AI_SUGGESTIONS_DEFAULT_PROMPT,
} from '@v2/constants/risk-factor-ai-suggestions-default-prompts.constant';

import {
  buildRiskFactorAiSuggestionPayload,
  hasRiskFactorAiSuggestionFieldContent,
} from './build-risk-factor-ai-suggestion-payload.util';
import {
  applyRiskFactorAiSuggestionFields,
  type RiskFactorAiSuggestionApplyInput,
} from './apply-risk-factor-ai-suggestion-fields.util';

const chemicalSuggestion: RiskFactorAiSuggestionApplyInput = {
  risk: 'Possibilidade de causar toxicidade sistêmica.',
  symptoms: 'Cefaleia, náusea e irritação.',
  affectedRegion: 'Sistema nervoso central, fígado e pele.',
  absorptionRoutes: 'Inalatória, cutânea e digestiva.',
  severity: 3,
};

const ergonomicSuggestion: RiskFactorAiSuggestionApplyInput = {
  risk: 'Possibilidade de lesões musculoesqueléticas por postura inadequada.',
  symptoms: 'Dor lombar e fadiga.',
  affectedRegion: 'Coluna vertebral, especialmente região lombar.',
  absorptionRoutes: '',
  severity: 3,
};

const accidentSuggestion: RiskFactorAiSuggestionApplyInput = {
  risk: 'Possibilidade de ocorrência de acidentes por queda de altura.',
  symptoms: 'Contusões e fraturas.',
  affectedRegion: 'Membros inferiores, coluna, tórax e crânio.',
  absorptionRoutes: '',
  severity: 4,
};

assert.deepEqual(
  applyRiskFactorAiSuggestionFields({}, chemicalSuggestion, 'replace-all'),
  {
    risk: chemicalSuggestion.risk,
    symptoms: chemicalSuggestion.symptoms,
    affectedRegion: chemicalSuggestion.affectedRegion,
    absorptionRoutes: chemicalSuggestion.absorptionRoutes,
    severity: 3,
  },
);

assert.equal(
  applyRiskFactorAiSuggestionFields({}, ergonomicSuggestion, 'replace-all').absorptionRoutes,
  '',
);
assert.equal(
  applyRiskFactorAiSuggestionFields({}, ergonomicSuggestion, 'replace-all').affectedRegion,
  'Coluna vertebral, especialmente região lombar.',
);
assert.equal(
  applyRiskFactorAiSuggestionFields({}, accidentSuggestion, 'replace-all').affectedRegion,
  'Membros inferiores, coluna, tórax e crânio.',
);
assert.equal(
  applyRiskFactorAiSuggestionFields({}, accidentSuggestion, 'replace-all').absorptionRoutes,
  '',
);

const filled = {
  risk: 'Texto original de risco.',
  symptoms: 'Sintoma original.',
  affectedRegion: 'Pele.',
  absorptionRoutes: '',
  severity: 4,
};

const filledOnlyEmpty = applyRiskFactorAiSuggestionFields(
  filled,
  chemicalSuggestion,
  'fill-empty',
);

assert.equal(filledOnlyEmpty.risk, 'Texto original de risco.');
assert.equal(filledOnlyEmpty.symptoms, 'Sintoma original.');
assert.equal(filledOnlyEmpty.affectedRegion, 'Pele.');
assert.equal(filledOnlyEmpty.absorptionRoutes, 'Inalatória, cutânea e digestiva.');
assert.equal(filledOnlyEmpty.severity, 4);
assert.equal(filledOnlyEmpty.risk.includes(chemicalSuggestion.risk), false);
assert.equal(filledOnlyEmpty.symptoms.includes('\n\n'), false);

const preservedConclusions = applyRiskFactorAiSuggestionFields(
  {
    ...filled,
    absorptionRoutes: 'Não se aplica',
    affectedRegion: 'Qualquer segmento corporal',
  },
  {
    ...chemicalSuggestion,
    absorptionRoutes: 'Inalatória',
    affectedRegion: 'Pele',
  },
  'fill-empty',
);
assert.equal(preservedConclusions.absorptionRoutes, 'Não se aplica');
assert.equal(preservedConclusions.affectedRegion, 'Qualquer segmento corporal');
assert.equal(preservedConclusions.severity, 4);

const preservedUndetermined = applyRiskFactorAiSuggestionFields(
  { ...filled, absorptionRoutes: 'Não determinada' },
  { ...chemicalSuggestion, absorptionRoutes: 'Cutânea' },
  'fill-empty',
);
assert.equal(preservedUndetermined.absorptionRoutes, 'Não determinada');

const biologicalEntry =
  'Inalatória, por bioaerossóis ou poeiras contaminadas; mucosas, por contato ou respingos; digestiva, por ingestão acidental, conforme as condições de exposição.';

const replacedBiologicalEntry = applyRiskFactorAiSuggestionFields(
  { ...filled, absorptionRoutes: 'Não se aplica' },
  { ...chemicalSuggestion, absorptionRoutes: biologicalEntry },
  'replace-all',
);
assert.equal(replacedBiologicalEntry.absorptionRoutes, biologicalEntry);
assert.equal(replacedBiologicalEntry.absorptionRoutes.includes('Não se aplica'), false);

const keptBiologicalEntry = applyRiskFactorAiSuggestionFields(
  { ...filled, absorptionRoutes: 'Não se aplica' },
  { ...chemicalSuggestion, absorptionRoutes: biologicalEntry },
  'fill-empty',
);
assert.equal(keptBiologicalEntry.absorptionRoutes, 'Não se aplica');

const replacedConclusions = applyRiskFactorAiSuggestionFields(
  { ...filled, absorptionRoutes: 'Não se aplica' },
  { ...chemicalSuggestion, absorptionRoutes: 'Inalatória' },
  'replace-all',
);
assert.equal(replacedConclusions.absorptionRoutes, 'Inalatória');

const replaced = applyRiskFactorAiSuggestionFields(filled, chemicalSuggestion, 'replace-all');
assert.equal(replaced.risk, chemicalSuggestion.risk);
assert.equal(replaced.symptoms, chemicalSuggestion.symptoms);
assert.equal(replaced.affectedRegion, chemicalSuggestion.affectedRegion);
assert.equal(replaced.absorptionRoutes, chemicalSuggestion.absorptionRoutes);
assert.equal(replaced.severity, 3);

const invalidSeverity = applyRiskFactorAiSuggestionFields(
  { ...filled, severity: 2 },
  { ...chemicalSuggestion, severity: 9 },
  'replace-all',
);
assert.equal(invalidSeverity.severity, 2);
assert.match(invalidSeverity.severityWarning || '', /inválida/);

assert.equal(
  applyRiskFactorAiSuggestionFields(
    { risk: '  Dor lombar  ' },
    ergonomicSuggestion,
    'fill-empty',
  ).risk,
  '  Dor lombar  ',
);

assert.equal(hasRiskFactorAiSuggestionFieldContent({ affectedRegion: 'Olhos' }), true);
assert.equal(hasRiskFactorAiSuggestionFieldContent({}), false);

const payload = buildRiskFactorAiSuggestionPayload({
  form: {
    type: 'QUI',
    name: 'Benzeno',
    cas: '71-43-2',
    affectedRegion: 'Medula óssea',
    absorptionRoutes: 'Inalatória',
    severity: 4,
  },
});
assert.equal(payload.knownData?.affectedRegion, 'Medula óssea');
assert.equal(payload.knownData?.absorptionRoutes, 'Inalatória');
assert.equal(payload.knownData?.severity, 4);
assert.equal(payload.cas, '71-43-2');

for (const prompt of [
  RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_PHYSICAL_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_BIOLOGICAL_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_ERGONOMIC_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_ACCIDENT_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_OTHER_AI_SUGGESTIONS_DEFAULT_PROMPT,
]) {
  assert.equal(prompt.includes('affectedRegion'), true);
  assert.equal(prompt.includes('absorptionRoutes'), true);
  assert.equal(prompt.includes('confidence'), true);
  assert.equal(prompt.includes('sourceTrace'), true);
  assert.equal(prompt.includes('warnings'), true);
}

assert.equal(RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes('FISPQ'), true);
assert.equal(RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes('Inalatória'), true);
assert.equal(RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes('cutânea'), true);
assert.equal(RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes('digestiva'), true);
assert.equal(
  RISK_FACTOR_ERGONOMIC_AI_SUGGESTIONS_DEFAULT_PROMPT.includes('Não invente vias de absorção'),
  true,
);
assert.equal(
  RISK_FACTOR_ERGONOMIC_AI_SUGGESTIONS_DEFAULT_PROMPT.includes('região lombar'),
  true,
);
assert.equal(
  RISK_FACTOR_ACCIDENT_AI_SUGGESTIONS_DEFAULT_PROMPT.includes(
    'Não imponha "Não se aplica" apenas porque a classificação é de acidente',
  ),
  true,
);
assert.equal(
  RISK_FACTOR_ACCIDENT_AI_SUGGESTIONS_DEFAULT_PROMPT.includes('Queda do mesmo nível: Não se aplica'),
  true,
);
assert.equal(
  RISK_FACTOR_PHYSICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes('Ruído: Não se aplica'),
  true,
);
assert.equal(
  RISK_FACTOR_ERGONOMIC_AI_SUGGESTIONS_DEFAULT_PROMPT.includes(
    'Movimentos repetitivos: Não se aplica',
  ),
  true,
);
assert.equal(
  RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes(
    'Solvente com via inalatória fundamentada: Inalatória',
  ),
  true,
);
assert.equal(
  RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes(
    'Substância com absorção cutânea fundamentada: Cutânea',
  ),
  true,
);
assert.equal(
  RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes(
    'Produto químico genérico sem dados suficientes: Não determinada',
  ),
  true,
);
assert.equal(
  RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT.includes(
    'Não presuma via cutânea apenas pelo contato com a pele',
  ),
  true,
);

const buttonSource = readFileSync(
  resolve('src/@v2/components/molecules/RiskFactorAiSuggestion/RiskFactorAiSuggestionButton.tsx'),
  'utf8',
);
const dialogSource = readFileSync(
  resolve('src/@v2/components/molecules/RiskFactorAiSuggestion/RiskFactorAiSuggestionApplyDialog.tsx'),
  'utf8',
);

assert.equal(buttonSource.includes("assignField('affectedRegion', applied.affectedRegion)"), true);
assert.equal(buttonSource.includes("assignField('absorptionRoutes', applied.absorptionRoutes)"), true);
assert.equal(buttonSource.includes("'replace-all'"), true);
assert.equal(buttonSource.includes('onSubmit'), false);
assert.equal(buttonSource.includes('useMut'), false);
assert.equal(buttonSource.includes('mergeRiskFactorAiSuggestionText'), false);
assert.equal(dialogSource.includes("useState<RiskFactorAiSuggestionApplyMode>('fill-empty')"), true);
assert.equal(dialogSource.includes('Preencher somente campos vazios'), true);
assert.equal(dialogSource.includes('Atualizar todos os campos'), true);
assert.equal(dialogSource.includes('Mesclar'), false);

console.log('apply-risk-factor-ai-suggestion-fields.util.spec.ts: OK');
