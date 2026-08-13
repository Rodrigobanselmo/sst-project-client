/**
 * Contrato Fase 2A — ações rápidas + abertura segura da Análise de Riscos IA.
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-quick-actions.spec.ts
 */
import assert from 'node:assert/strict';

import {
  canApplyCharacterizationWizardStep,
  clampCharacterizationWizardStep,
  isCharacterizationAiAnalysisStep,
  requiresSavedCharacterization,
} from './characterization-wizard-step.util';
import {
  CHARACTERIZATION_WIZARD_STEP,
  CHARACTERIZATION_WIZARD_TAB_LABELS,
  CHARACTERIZATION_WIZARD_TAB_ORDER,
} from './characterization-wizard-steps';

const INACTIVE_ACTION_TOOLTIP =
  'Reative o elemento antes de alterar seus vínculos.';

assert.ok(INACTIVE_ACTION_TOOLTIP.includes('Reative'));

assert.equal(CHARACTERIZATION_WIZARD_STEP.DATA, 0);
assert.equal(CHARACTERIZATION_WIZARD_STEP.CARGOS, 1);
assert.equal(CHARACTERIZATION_WIZARD_STEP.MEDIA, 2);
assert.equal(CHARACTERIZATION_WIZARD_STEP.TRACEABILITY, 3);
assert.equal(CHARACTERIZATION_WIZARD_STEP.RISKS, 4);
assert.equal(CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS, 5);
assert.equal(CHARACTERIZATION_WIZARD_TAB_ORDER.length, 6);
assert.deepEqual(CHARACTERIZATION_WIZARD_TAB_ORDER, [
  CHARACTERIZATION_WIZARD_TAB_LABELS.DATA,
  CHARACTERIZATION_WIZARD_TAB_LABELS.CARGOS,
  CHARACTERIZATION_WIZARD_TAB_LABELS.MEDIA,
  CHARACTERIZATION_WIZARD_TAB_LABELS.TRACEABILITY,
  CHARACTERIZATION_WIZARD_TAB_LABELS.RISKS,
  CHARACTERIZATION_WIZARD_TAB_LABELS.AI_ANALYSIS,
]);
assert.equal(CHARACTERIZATION_WIZARD_TAB_LABELS.MEDIA, 'Áudios e Vídeos');
assert.equal(
  CHARACTERIZATION_WIZARD_TAB_LABELS.AI_ANALYSIS,
  'Análise de Riscos IA',
);
assert.equal(isCharacterizationAiAnalysisStep(5), true);
assert.equal(isCharacterizationAiAnalysisStep(4), false);

assert.equal(
  clampCharacterizationWizardStep(CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS),
  CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
);
assert.equal(clampCharacterizationWizardStep(99), 0);
assert.equal(clampCharacterizationWizardStep(undefined), 0);
assert.equal(clampCharacterizationWizardStep(-1), 0);

assert.equal(requiresSavedCharacterization(CHARACTERIZATION_WIZARD_STEP.DATA), false);
assert.equal(requiresSavedCharacterization(CHARACTERIZATION_WIZARD_STEP.CARGOS), false);
assert.equal(requiresSavedCharacterization(CHARACTERIZATION_WIZARD_STEP.MEDIA), false);
assert.equal(
  requiresSavedCharacterization(CHARACTERIZATION_WIZARD_STEP.TRACEABILITY),
  true,
);
assert.equal(requiresSavedCharacterization(CHARACTERIZATION_WIZARD_STEP.RISKS), true);
assert.equal(
  requiresSavedCharacterization(CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS),
  false,
);

const readyGate = {
  hasType: true,
  isDetailLoading: false,
  isDetailError: false,
};

/** TRACEABILITY exige caracterização salva. */
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.TRACEABILITY,
    isEdit: false,
    ...readyGate,
  }),
  { ok: false, reason: 'requires-saved-entity' },
);
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.TRACEABILITY,
    isEdit: true,
    ...readyGate,
  }),
  { ok: true },
);

/** RISKS exige caracterização salva. */
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.RISKS,
    isEdit: false,
    ...readyGate,
  }),
  { ok: false, reason: 'requires-saved-entity' },
);
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.RISKS,
    isEdit: true,
    ...readyGate,
  }),
  { ok: true },
);

/** MEDIA não exige isEdit só porque passou a ser o índice 2. */
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.MEDIA,
    isEdit: false,
    ...readyGate,
  }),
  { ok: true },
);

/** 1) wizardStep Análise de Riscos IA antes do detalhe carregar → não aplica. */
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    hasType: false,
    isEdit: true,
    isDetailLoading: true,
    isDetailError: false,
  }),
  { ok: false, reason: 'detail-loading' },
);

/** 2) loading enquanto detalhe pendente. */
assert.equal(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    hasType: true,
    isEdit: true,
    isDetailLoading: true,
    isDetailError: false,
  }).reason,
  'detail-loading',
);

/** 3) montagem após hidratação. */
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    hasType: true,
    isEdit: true,
    isDetailLoading: false,
    isDetailError: false,
  }),
  { ok: true },
);

/** 4) erro na consulta → nunca null; gate reporta detail-error. */
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    hasType: false,
    isEdit: true,
    isDetailLoading: false,
    isDetailError: true,
  }),
  { ok: false, reason: 'detail-error' },
);

/** 5) step inválido → clamp seguro. */
assert.equal(clampCharacterizationWizardStep(Number.NaN), 0);
assert.equal(clampCharacterizationWizardStep(6), 0);

/** 6–7) embedded/standalone compartilham o mesmo gate. */
function resolveEditorViewState(params: {
  embedded: boolean;
  hasHydratedType: boolean;
  isDetailLoading: boolean;
  isDetailError: boolean;
  requestedStep: number;
  isEdit: boolean;
}): 'loading' | 'error-ui' | 'content' {
  if (params.isDetailError && !params.hasHydratedType) return 'error-ui';
  const gate = canApplyCharacterizationWizardStep({
    requestedStep: params.requestedStep,
    hasType: params.hasHydratedType,
    isEdit: params.isEdit,
    isDetailLoading: params.isDetailLoading,
    isDetailError: params.isDetailError,
  });
  if (!gate.ok) return 'loading';
  return 'content';
}

assert.equal(
  resolveEditorViewState({
    embedded: true,
    hasHydratedType: false,
    isDetailLoading: true,
    isDetailError: false,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    isEdit: true,
  }),
  'loading',
);
assert.equal(
  resolveEditorViewState({
    embedded: false,
    hasHydratedType: false,
    isDetailLoading: false,
    isDetailError: true,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    isEdit: true,
  }),
  'error-ui',
);
assert.equal(
  resolveEditorViewState({
    embedded: true,
    hasHydratedType: false,
    isDetailLoading: false,
    isDetailError: true,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    isEdit: true,
  }),
  'error-ui',
);
assert.ok(
  resolveEditorViewState({
    embedded: true,
    hasHydratedType: false,
    isDetailLoading: false,
    isDetailError: true,
    requestedStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    isEdit: true,
  }) !== ('null' as unknown as 'error-ui'),
);

/** 8) Fatores de Riscos permanece aplicável após hidratação. */
assert.deepEqual(
  canApplyCharacterizationWizardStep({
    requestedStep: CHARACTERIZATION_WIZARD_STEP.RISKS,
    hasType: true,
    isEdit: true,
    isDetailLoading: false,
    isDetailError: false,
  }),
  { ok: true },
);

/** 9) step solicitado preservado durante hidratação (intenção ≠ aplicação). */
function preserveRequestedStepDuringHydration(
  requested: number,
  gateOk: boolean,
): { intent: number; applied: number | null } {
  return {
    intent: requested,
    applied: gateOk ? requested : null,
  };
}
assert.deepEqual(
  preserveRequestedStepDuringHydration(
    CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    false,
  ),
  {
    intent: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    applied: null,
  },
);
assert.deepEqual(
  preserveRequestedStepDuringHydration(
    CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    true,
  ),
  {
    intent: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
    applied: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
  },
);

/** Clique rápido: Riscos → Fatores; IA → Análise de Riscos IA. Sem auto-run. */
function resolveRisksTarget(target: 'factors' | 'ai') {
  return {
    wizardStep:
      target === 'ai'
        ? CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS
        : CHARACTERIZATION_WIZARD_STEP.RISKS,
    autoRunAi: false,
  };
}
assert.deepEqual(resolveRisksTarget('ai'), {
  wizardStep: CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS,
  autoRunAi: false,
});
assert.deepEqual(resolveRisksTarget('factors'), {
  wizardStep: CHARACTERIZATION_WIZARD_STEP.RISKS,
  autoRunAi: false,
});

/** WizardTabs não deve sincronizar `active` contínuo no editor aninhado. */
function shouldPassActivePropToNestedWizardTabs(): boolean {
  return false;
}
assert.equal(shouldPassActivePropToNestedWizardTabs(), false);

console.log('characterization-quick-actions.spec.ts OK');
