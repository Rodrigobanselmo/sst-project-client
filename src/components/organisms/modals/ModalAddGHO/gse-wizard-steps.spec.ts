/**
 * Contrato da 1ª etapa — Análise de Riscos IA no GSE técnico (layout page).
 *
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/gse-wizard-steps.spec.ts
 */
import assert from 'node:assert/strict';

import {
  CHARACTERIZATION_WIZARD_STEP,
  CHARACTERIZATION_WIZARD_TAB_LABELS,
  CHARACTERIZATION_WIZARD_TAB_ORDER,
} from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-steps';

import { HomogeneousGroupRoutes } from '@v2/constants/routes/homogeneous-group.routes';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';

import { buildAiRiskAnalysisSessionKey } from '../ModalAddCharacterization/utils/ai-risk-analysis-session-storage.util';
import {
  clampGseWizardStep,
  decideApplyGseWizardStep,
  getGseWizardTabOptions,
  GSE_WIZARD_STEP,
  GSE_WIZARD_TAB_LABELS,
  resolveGseTableOpenStep,
} from './gse-wizard-steps';

assert.equal(GSE_WIZARD_STEP.DATA, 0);
assert.equal(GSE_WIZARD_STEP.CARGOS, 1);
assert.equal(GSE_WIZARD_STEP.RISKS, 2);
assert.equal(GSE_WIZARD_STEP.AI_ANALYSIS, 3);
assert.equal(GSE_WIZARD_STEP.AI_ANALYSIS, GSE_WIZARD_STEP.RISKS + 1);
assert.equal(GSE_WIZARD_TAB_LABELS.RISKS, 'Fatores de Riscos');
assert.equal(GSE_WIZARD_TAB_LABELS.AI_ANALYSIS, 'Análise de Riscos IA');
assert.equal(
  GSE_WIZARD_TAB_LABELS.AI_ANALYSIS,
  CHARACTERIZATION_WIZARD_TAB_LABELS.AI_ANALYSIS,
);

const pageSaved = getGseWizardTabOptions({ layout: 'page', isEdit: true });
assert.deepEqual(
  pageSaved.map((tab) => tab.label),
  ['Dados', 'Cargos', 'Fatores de Riscos', 'Análise de Riscos IA'],
);
assert.equal(pageSaved.length, 4);
assert.equal(pageSaved[2].disabled, false);
assert.equal(pageSaved[3].disabled, false);

const pageUnsaved = getGseWizardTabOptions({ layout: 'page', isEdit: false });
assert.equal(pageUnsaved[GSE_WIZARD_STEP.RISKS].disabled, true);
assert.equal(pageUnsaved[GSE_WIZARD_STEP.AI_ANALYSIS].disabled, true);

const modalTabs = getGseWizardTabOptions({ layout: 'modal', isEdit: true });
assert.deepEqual(
  modalTabs.map((tab) => tab.label),
  ['Dados', 'Cargos'],
);
assert.equal(
  modalTabs.some((tab) => tab.label === GSE_WIZARD_TAB_LABELS.AI_ANALYSIS),
  false,
);

assert.equal(
  HomogeneousGroupRoutes.AI_ANALYZE,
  'v2/companies/:companyId/workspaces/:workspaceId/homogeneous-groups/:gseId/ai-analyze',
);
assert.equal(
  CharacterizationRoutes.CHARACTERIZATION.AI_ANALYZE,
  'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-analyze',
);

assert.equal(CHARACTERIZATION_WIZARD_STEP.DATA, 0);
assert.equal(CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS, 5);
assert.equal(CHARACTERIZATION_WIZARD_TAB_ORDER.length, 6);

assert.equal(clampGseWizardStep(undefined), GSE_WIZARD_STEP.DATA);
assert.equal(clampGseWizardStep(GSE_WIZARD_STEP.CARGOS), 1);
assert.equal(clampGseWizardStep(GSE_WIZARD_STEP.RISKS), 2);
assert.equal(clampGseWizardStep(GSE_WIZARD_STEP.AI_ANALYSIS), 3);
assert.equal(clampGseWizardStep(CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS), 0);
assert.equal(resolveGseTableOpenStep('row'), GSE_WIZARD_STEP.DATA);
assert.equal(resolveGseTableOpenStep('edit'), GSE_WIZARD_STEP.DATA);
assert.equal(resolveGseTableOpenStep('cargos'), GSE_WIZARD_STEP.CARGOS);
assert.equal(resolveGseTableOpenStep('risks'), GSE_WIZARD_STEP.RISKS);
assert.equal(resolveGseTableOpenStep('ai'), GSE_WIZARD_STEP.AI_ANALYSIS);

const applyCargos = decideApplyGseWizardStep({
  enabled: true,
  alreadyApplied: false,
  requestedStep: GSE_WIZARD_STEP.CARGOS,
  activeStep: 0,
  stepCount: 4,
});
assert.equal(applyCargos.shouldGoToStep, true);
assert.equal(applyCargos.target, 1);

const applyRisks = decideApplyGseWizardStep({
  enabled: true,
  alreadyApplied: false,
  requestedStep: GSE_WIZARD_STEP.RISKS,
  activeStep: 0,
  stepCount: 4,
});
assert.equal(applyRisks.target, 2);

const applyAi = decideApplyGseWizardStep({
  enabled: true,
  alreadyApplied: false,
  requestedStep: GSE_WIZARD_STEP.AI_ANALYSIS,
  activeStep: 0,
  stepCount: 4,
});
assert.equal(applyAi.target, 3);

const applyData = decideApplyGseWizardStep({
  enabled: true,
  alreadyApplied: false,
  requestedStep: GSE_WIZARD_STEP.DATA,
  activeStep: 0,
  stepCount: 4,
});
assert.equal(applyData.shouldGoToStep, false);
assert.equal(applyData.markApplied, true);

const modalStepCount = decideApplyGseWizardStep({
  enabled: true,
  alreadyApplied: false,
  requestedStep: GSE_WIZARD_STEP.AI_ANALYSIS,
  activeStep: 0,
  stepCount: 2,
});
assert.equal(modalStepCount.shouldGoToStep, false);

const gseSession = buildAiRiskAnalysisSessionKey({
  gseId: 'gse-1',
  riskGroupId: 'rg-1',
  companyId: 'co-1',
  workspaceId: 'ws-1',
});
const elementSession = buildAiRiskAnalysisSessionKey({
  characterizationId: 'el-1',
  riskGroupId: 'rg-1',
  companyId: 'co-1',
  workspaceId: 'ws-1',
});
assert.equal(gseSession?.startsWith('gse-ai-risk-analysis:'), true);
assert.equal(elementSession?.startsWith('characterization-ai-risk-analysis:'), true);
assert.notEqual(gseSession, elementSession);

console.log('gse-wizard-steps.spec.ts ok');
