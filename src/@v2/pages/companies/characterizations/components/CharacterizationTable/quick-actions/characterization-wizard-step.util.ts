import { CHARACTERIZATION_WIZARD_STEP } from './characterization-wizard-steps';

/** Quantidade de etapas do wizard da edição de caracterização. */
export const CHARACTERIZATION_EDITOR_STEP_COUNT = 6;

export function clampCharacterizationWizardStep(
  step: number | undefined | null,
): number {
  if (typeof step !== 'number' || !Number.isFinite(step)) {
    return CHARACTERIZATION_WIZARD_STEP.DATA;
  }
  const rounded = Math.trunc(step);
  if (rounded < 0) return CHARACTERIZATION_WIZARD_STEP.DATA;
  if (rounded >= CHARACTERIZATION_EDITOR_STEP_COUNT) {
    return CHARACTERIZATION_WIZARD_STEP.DATA;
  }
  return rounded;
}

export function isCharacterizationAiAnalysisStep(
  step: number | undefined | null,
): boolean {
  return (
    typeof step === 'number' &&
    step === CHARACTERIZATION_WIZARD_STEP.AI_ANALYSIS
  );
}

const STEPS_REQUIRING_SAVED_ENTITY = new Set<number>([
  CHARACTERIZATION_WIZARD_STEP.RISKS,
  CHARACTERIZATION_WIZARD_STEP.TRACEABILITY,
]);

export function requiresSavedCharacterization(step: number): boolean {
  return STEPS_REQUIRING_SAVED_ENTITY.has(step);
}

/**
 * A etapa solicitada só pode ser aplicada quando o editor tem o mínimo
 * necessário. Fatores de Riscos e Rastreabilidade Técnica exigem
 * caracterização já persistida (`isEdit`).
 */
export function canApplyCharacterizationWizardStep(params: {
  requestedStep?: number | null;
  hasType: boolean;
  isEdit: boolean;
  isDetailLoading: boolean;
  isDetailError: boolean;
}): { ok: boolean; reason?: string } {
  const step = clampCharacterizationWizardStep(params.requestedStep);

  if (params.isDetailError) {
    return { ok: false, reason: 'detail-error' };
  }
  if (params.isDetailLoading) {
    return { ok: false, reason: 'detail-loading' };
  }
  if (!params.hasType) {
    return { ok: false, reason: 'missing-type' };
  }
  if (requiresSavedCharacterization(step) && !params.isEdit) {
    return { ok: false, reason: 'requires-saved-entity' };
  }
  return { ok: true };
}
