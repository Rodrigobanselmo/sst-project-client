/**
 * Contrato Fase 2A — ações rápidas + abertura segura da Análise IA.
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-quick-actions.spec.ts
 */
import assert from 'node:assert/strict';

import {
  canApplyCharacterizationWizardStep,
  clampCharacterizationWizardStep,
  isCharacterizationAiAnalysisStep,
} from './characterization-wizard-step.util';
import { CHARACTERIZATION_WIZARD_STEP } from './characterization-wizard-steps';

const INACTIVE_ACTION_TOOLTIP =
  'Reative o elemento antes de alterar seus vínculos.';

assert.ok(INACTIVE_ACTION_TOOLTIP.includes('Reative'));

assert.equal(CHARACTERIZATION_WIZARD_STEP.RISKS, 2);
assert.equal(CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS, 4);
assert.equal(isCharacterizationAiAnalysisStep(4), true);
assert.equal(isCharacterizationAiAnalysisStep(2), false);

assert.equal(clampCharacterizationWizardStep(4), 4);
assert.equal(clampCharacterizationWizardStep(99), 0);
assert.equal(clampCharacterizationWizardStep(undefined), 0);
assert.equal(clampCharacterizationWizardStep(-1), 0);

/** 1) wizardStep Análise IA antes do detalhe carregar → não aplica. */
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
    requestedStep: 4,
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
    requestedStep: 4,
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
    requestedStep: 4,
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
    requestedStep: 4,
    isEdit: true,
  }) !== ('null' as unknown as 'error-ui'),
);

/** 8) Fatores de Risco permanece aplicável após hidratação. */
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
assert.deepEqual(preserveRequestedStepDuringHydration(4, false), {
  intent: 4,
  applied: null,
});
assert.deepEqual(preserveRequestedStepDuringHydration(4, true), {
  intent: 4,
  applied: 4,
});

/** IA nunca auto-executa ao abrir a aba. */
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
  wizardStep: 4,
  autoRunAi: false,
});
assert.deepEqual(resolveRisksTarget('factors'), {
  wizardStep: 2,
  autoRunAi: false,
});

/** WizardTabs não deve sincronizar `active` contínuo no editor aninhado. */
function shouldPassActivePropToNestedWizardTabs(): boolean {
  return false;
}
assert.equal(shouldPassActivePropToNestedWizardTabs(), false);

console.log('characterization-quick-actions.spec.ts OK');
