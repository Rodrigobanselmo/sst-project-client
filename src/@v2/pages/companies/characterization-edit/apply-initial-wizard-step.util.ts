import { clampCharacterizationWizardStep } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-step.util';

export type ApplyInitialWizardStepDecision = {
  /** Se true, chamar goToStep(target). */
  shouldGoToStep: boolean;
  target?: number;
  /** Se true, marcar appliedRef — não reaplicar depois. */
  markApplied: boolean;
};

/**
 * Decide se o step inicial ainda deve ser aplicado.
 * Após markApplied, navegações manuais do usuário têm prioridade absoluta.
 */
export function decideApplyInitialWizardStep(params: {
  enabled: boolean;
  alreadyApplied: boolean;
  requestedStep?: number;
  activeStep: number;
  stepCount: number;
}): ApplyInitialWizardStepDecision {
  if (params.alreadyApplied) {
    return { shouldGoToStep: false, markApplied: true };
  }

  if (!params.enabled) {
    return { shouldGoToStep: false, markApplied: false };
  }

  if (typeof params.requestedStep !== 'number') {
    // Sem intenção explícita: não forçar step; liberar navegação manual.
    return { shouldGoToStep: false, markApplied: true };
  }

  const target = clampCharacterizationWizardStep(params.requestedStep);
  if (target < 0 || target >= params.stepCount) {
    return { shouldGoToStep: false, markApplied: false };
  }

  if (params.activeStep === target) {
    return { shouldGoToStep: false, target, markApplied: true };
  }

  return { shouldGoToStep: true, target, markApplied: true };
}
