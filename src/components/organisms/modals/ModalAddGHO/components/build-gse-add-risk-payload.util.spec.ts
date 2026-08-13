/**
 * Persistência da 1ª etapa — Adicionar no gseId; revisão só no RiskFactorData do GSE.
 *
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/components/build-gse-add-risk-payload.util.spec.ts
 */
import assert from 'node:assert/strict';

import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import type { IRiskData } from 'core/interfaces/api/IRiskData';

import { buildModularRiskUpsert } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/build-modular-risk-upsert.util';
import { buildGseAddRiskPayload } from './build-gse-add-risk-payload.util';

const GSE_ID = 'gse-tech-1';
const ELEMENT_ID = 'element-1';

const risk: DetailedRisk = {
  id: 'risk-catalog-1',
  name: 'Ruído',
  type: 'FIS',
  explanation: 'Evidência no elemento Oficina',
  generateSource: 'Máquinas',
  probability: 3,
  recommendedEngineeringMeasures: ['Isolamento'],
  recommendedAdministrativeMeasures: ['Pausas'],
  existingEngineeringMeasures: ['EPC atual'],
  existingAdministrativeMeasures: ['Treinamento'],
  confidence: 0.8,
};

const addPayload = buildGseAddRiskPayload({
  gseId: GSE_ID,
  companyId: 'co-1',
  workspaceId: 'ws-1',
  riskGroupId: 'rg-1',
  risk,
});

assert.equal(addPayload.homogeneousGroupId, GSE_ID);
assert.notEqual(addPayload.homogeneousGroupId, ELEMENT_ID);
assert.equal(addPayload.riskId, 'risk-catalog-1');
assert.equal(addPayload.probability, 3);
assert.equal(addPayload.id, undefined);
assert.equal(addPayload.generateSourcesAddOnly?.[0]?.name, 'Máquinas');
assert.ok((addPayload.engsAddOnly?.length || 0) > 0);
assert.ok((addPayload.admsAddOnly?.length || 0) > 0);
assert.ok((addPayload.recAddOnly?.length || 0) > 0);

const keptOnly: DetailedRisk = {
  ...risk,
  probability: 5,
  generateSource: '',
  recommendedEngineeringMeasures: ['Isolamento'],
  recommendedAdministrativeMeasures: [],
  existingEngineeringMeasures: [],
  existingAdministrativeMeasures: ['Treinamento'],
};

const keptPayload = buildGseAddRiskPayload({
  gseId: GSE_ID,
  companyId: 'co-1',
  workspaceId: 'ws-1',
  riskGroupId: 'rg-1',
  risk: keptOnly,
});

assert.equal(keptPayload.homogeneousGroupId, GSE_ID);
assert.equal(keptPayload.probability, 5);
assert.equal((keptPayload.generateSourcesAddOnly || []).length, 0);
assert.equal((keptPayload.engsAddOnly || []).length, 0);
assert.equal(keptPayload.admsAddOnly?.[0]?.medName, 'Treinamento');
assert.equal(keptPayload.recAddOnly?.length, 1);
assert.equal(keptPayload.recAddOnly?.[0]?.recName, 'Isolamento');

const gseRiskData = {
  id: 'rfd-gse-1',
  riskId: 'risk-catalog-1',
  companyId: 'co-1',
} as IRiskData;

const reviewPayload = buildModularRiskUpsert({
  field: 'generateSource',
  value: 'Forno da oficina',
  riskData: gseRiskData,
  riskGroupId: 'rg-1',
  companyId: 'co-1',
  workspaceId: 'ws-1',
  homogeneousGroupId: GSE_ID,
});

assert.ok(reviewPayload);
assert.equal(reviewPayload?.id, 'rfd-gse-1');
assert.equal(reviewPayload?.homogeneousGroupId, GSE_ID);
assert.notEqual(reviewPayload?.homogeneousGroupId, ELEMENT_ID);
assert.equal(reviewPayload?.riskId, 'risk-catalog-1');

console.log('build-gse-add-risk-payload.util.spec.ts ok');
