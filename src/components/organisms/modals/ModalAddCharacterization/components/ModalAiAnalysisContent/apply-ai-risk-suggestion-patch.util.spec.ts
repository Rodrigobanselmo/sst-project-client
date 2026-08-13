/**
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/apply-ai-risk-suggestion-patch.util.spec.ts
 */
import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import {
  applyAiRiskSuggestionPatch,
  removeAiRiskMeasureAt,
  replaceAiRiskMeasureAt,
  resolveCurrentAiRisk,
} from './apply-ai-risk-suggestion-patch.util';
import { buildGseAddRiskPayload } from '../../../ModalAddGHO/components/build-gse-add-risk-payload.util';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const baseRisk: DetailedRisk = {
  id: 'risk-1',
  name: 'Postura sentada por longos períodos',
  type: 'ERG',
  explanation: 'Uso de computador em escritório',
  generateSource: 'Postura em escritório',
  probability: 3,
  recommendedEngineeringMeasures: ['Ajuste de cadeira', 'Suporte de monitor'],
  recommendedAdministrativeMeasures: ['Pausas de 10 min', 'Ginástica laboral'],
  existingEngineeringMeasures: ['Cadeira existente'],
  existingAdministrativeMeasures: ['Orientação verbal'],
  confidence: 0.8,
};

const visible = [baseRisk];

assert(
  resolveCurrentAiRisk({}, visible, 'risk-1')?.id === 'risk-1',
  'resolveCurrentAiRisk usa a sugestão original',
);

let modified = applyAiRiskSuggestionPatch({}, visible, 'risk-1', (risk) => ({
  ...risk,
  probability: 5,
}));
assert(modified['risk-1'].probability === 5, 'probabilidade pode ser alterada antes do Add');
assert(visible[0].probability === 3, 'sugestão original não é mutada');

modified = applyAiRiskSuggestionPatch(
  modified,
  visible,
  'risk-1',
  (risk) => ({
    ...risk,
    recommendedEngineeringMeasures: removeAiRiskMeasureAt(
      risk.recommendedEngineeringMeasures,
      0,
    ),
  }),
);
assert(
  modified['risk-1'].recommendedEngineeringMeasures.join('|') ===
    'Suporte de monitor',
  'remover uma medida não remove as demais',
);
assert(
  modified['risk-1'].recommendedAdministrativeMeasures.length === 2,
  'medidas administrativas permanecem ao remover engenharia',
);

modified = applyAiRiskSuggestionPatch(
  modified,
  visible,
  'risk-1',
  (risk) => ({
    ...risk,
    generateSource: '',
  }),
);
assert(modified['risk-1'].generateSource === '', 'remover fonte geradora funciona');

modified = applyAiRiskSuggestionPatch(
  modified,
  visible,
  'risk-1',
  (risk) => ({
    ...risk,
    recommendedAdministrativeMeasures: replaceAiRiskMeasureAt(
      risk.recommendedAdministrativeMeasures,
      1,
      'Ginástica laboral diária',
    ),
  }),
);
assert(
  modified['risk-1'].recommendedAdministrativeMeasures[1] ===
    'Ginástica laboral diária',
  'editar uma medida não altera as outras',
);

const kept = resolveCurrentAiRisk(modified, visible, 'risk-1');
assert(kept, 'risco editado continua resolvível');

const gsePayload = buildGseAddRiskPayload({
  gseId: 'gse-admin-1',
  companyId: 'co-1',
  workspaceId: 'ws-1',
  riskGroupId: 'rg-1',
  risk: kept as DetailedRisk,
});

assert(gsePayload.homogeneousGroupId === 'gse-admin-1', 'Add do GSE grava no gseId');
assert(gsePayload.probability === 5, 'payload usa probabilidade editada');
assert(
  (gsePayload.generateSourcesAddOnly || []).length === 0,
  'payload não inclui fonte geradora removida',
);
assert(
  gsePayload.recAddOnly?.some((item) => item.recName === 'Suporte de monitor') ===
    true,
  'payload mantém a medida de engenharia restante',
);
assert(
  gsePayload.recAddOnly?.some((item) => item.recName === 'Ajuste de cadeira') ===
    false,
  'payload não inclui a medida de engenharia removida',
);
assert(
  gsePayload.recAddOnly?.some((item) => item.recName === 'Pausas de 10 min') ===
    true,
  'payload mantém medidas administrativas não removidas',
);

const elementoId = 'element-characterization-1';
assert(
  gsePayload.homogeneousGroupId !== elementoId,
  'payload do GSE não usa homogeneousGroupId do Elemento',
);

console.log('apply-ai-risk-suggestion-patch.util.spec.ts OK');
