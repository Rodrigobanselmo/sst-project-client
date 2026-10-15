/**
 * Etapa 3 — transferência DetailedRisk → ExistingRiskReview + vínculo mínimo.
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/build-existing-risk-review-from-detailed-risk.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import { buildCatalogOnlyRiskLinkPayload } from '../suggest-catalog-risks-ai/build-catalog-only-risk-link-payload.util';
import { buildExistingRiskReviewFromDetailedRisk } from './build-existing-risk-review-from-detailed-risk.util';

const risk: DetailedRisk = {
  id: 'risk-new-1',
  name: 'Calor',
  type: 'FIS',
  explanation: 'Forno contínuo',
  generateSource: 'Forno',
  probability: 4,
  recommendedEngineeringMeasures: ['Isolamento'],
  recommendedAdministrativeMeasures: ['Pausas'],
  existingEngineeringMeasures: ['EPC atual'],
  existingAdministrativeMeasures: [],
  confidence: 0.7,
};

const review = buildExistingRiskReviewFromDetailedRisk({
  risk,
  riskFactorDataId: 'rfd-1',
});

assert.equal(review.riskId, 'risk-new-1');
assert.equal(review.riskFactorDataId, 'rfd-1');
assert.deepEqual(
  review.suggestions.map((s) => s.field),
  [
    'generateSource',
    'existingEngineeringMeasures',
    'recommendedEngineeringMeasures',
    'recommendedAdministrativeMeasures',
    'probability',
  ],
);
assert.equal(
  review.suggestions.find((s) => s.field === 'existingEngineeringMeasures')
    ?.intent,
  'verificar',
);
assert.equal(
  review.suggestions.find((s) => s.field === 'recommendedEngineeringMeasures')
    ?.intent,
  'implementar',
);
assert.equal(
  review.suggestions.find((s) => s.field === 'probability')?.suggestedValues,
  4,
);

const incomplete = buildExistingRiskReviewFromDetailedRisk({
  risk: {
    ...risk,
    generateSource: '',
    probability: 0 as unknown as number,
    existingEngineeringMeasures: [],
    recommendedEngineeringMeasures: [],
    recommendedAdministrativeMeasures: ['Só adm'],
  },
});
assert.deepEqual(
  incomplete.suggestions.map((s) => s.field),
  ['recommendedAdministrativeMeasures'],
  'campos vazios não inventam sugestões; distinção existente/recomendação preservada',
);

const link = buildCatalogOnlyRiskLinkPayload({
  riskGroupId: 'rg-1',
  entityId: 'gse-1',
  selectedRiskIds: ['risk-new-1'],
  workspaceId: 'ws-1',
});
assert.ok(link);
assert.equal(link!.keepEmpty, true);
assert.deepEqual(link!.riskIds, ['risk-new-1']);
assert.equal('probability' in link!, false);
assert.equal('generateSourcesAddOnly' in link!, false);
assert.equal('engsAddOnly' in link!, false);
assert.equal('admsAddOnly' in link!, false);
assert.equal('recAddOnly' in link!, false);
assert.equal('probabilityAfter' in link!, false);

const provider = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/RiskFactorsAiProvider.tsx',
  'utf8',
);
const candidates = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/RiskFactorAiNewRiskCandidates.tsx',
  'utf8',
);
const gseAdd = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/build-gse-add-risk-payload.util.ts',
  'utf8',
);
const gseContent = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoAiAnalysisContent.tsx',
  'utf8',
);
const elemento = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ModalAiAnalysisContent.tsx',
  'utf8',
);

assert.ok(provider.includes('RiskFactorAiNewRiskCandidates'));
assert.ok(candidates.includes('buildCatalogOnlyRiskLinkPayload'));
assert.ok(candidates.includes('buildExistingRiskReviewFromDetailedRisk'));
assert.ok(candidates.includes('Adicionar risco'));
assert.ok(candidates.includes('Descartar'));
assert.equal(candidates.includes('buildGseAddRiskPayload'), false);
assert.ok(
  gseAdd.includes('probability: params.risk.probability'),
  'payload antigo GSE permanece para a aba antiga',
);
assert.ok(
  gseContent.includes('buildGseAddRiskPayload'),
  'aba antiga GSE ainda usa payload completo',
);
assert.ok(
  elemento.includes('probability: risk.probability'),
  'aba antiga Elemento ainda usa inclusão completa',
);
assert.ok(candidates.includes('mutateAsync'), 'inclusão usa upsert many');
assert.equal(
  candidates.includes('useMutateAiAnalyze'),
  false,
  'inclusão de candidato não chama análise IA',
);
assert.equal(
  candidates.includes('useMutateAiAnalyzeGse'),
  false,
  'inclusão não chama análise GSE',
);
assert.ok(
  candidates.includes('buildCatalogOnlyRiskLinkPayload'),
  'reutiliza vínculo mínimo keepEmpty',
);

console.log('build-existing-risk-review-from-detailed-risk.util.spec.ts OK');
