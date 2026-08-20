import { CHARACTERIZATION_WIZARD_TAB_LABELS } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-steps';

export const GSE_WIZARD_STEP = {
  DATA: 0,
  CARGOS: 1,
  RISKS: 2,
  AI_ANALYSIS: 3,
} as const;

export const GSE_WIZARD_TAB_LABELS = {
  DATA: CHARACTERIZATION_WIZARD_TAB_LABELS.DATA,
  CARGOS: CHARACTERIZATION_WIZARD_TAB_LABELS.CARGOS,
  RISKS: CHARACTERIZATION_WIZARD_TAB_LABELS.RISKS,
  AI_ANALYSIS: CHARACTERIZATION_WIZARD_TAB_LABELS.AI_ANALYSIS,
} as const;

export type GseAddLayout = 'modal' | 'page';

export const GSE_EDITOR_STEP_COUNT = 4;

/** Query do editor GSE na home SST. Ausente = usa `initialWizardStep` (lista continua em Dados). */
export const GSE_WIZARD_STEP_QUERY_KEY = 'gseWizardStep';

function firstQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseOptionalGseWizardStep(
  raw: string | string[] | undefined,
): number | undefined {
  const value = firstQueryString(raw);
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  const truncated = Math.trunc(parsed);
  if (truncated < 0 || truncated >= GSE_EDITOR_STEP_COUNT) return undefined;
  return truncated;
}

/** Honra `gseWizardStep` só quando o `ghoId` da URL é o GSE aberto. */
export function resolveGseWizardStepFromQuery(params: {
  ghoId?: string;
  queryGhoId?: string | string[];
  queryStep?: string | string[];
}): number | undefined {
  const queryGhoId = firstQueryString(params.queryGhoId);
  if (!params.ghoId || !queryGhoId || queryGhoId !== params.ghoId) {
    return undefined;
  }
  return parseOptionalGseWizardStep(params.queryStep);
}

export type GseTableOpenAction = 'row' | 'edit' | 'cargos' | 'risks' | 'ai';

export function clampGseWizardStep(
  step: number | undefined | null,
): number {
  if (typeof step !== 'number' || !Number.isFinite(step)) {
    return GSE_WIZARD_STEP.DATA;
  }
  const rounded = Math.trunc(step);
  if (rounded < 0 || rounded >= GSE_EDITOR_STEP_COUNT) {
    return GSE_WIZARD_STEP.DATA;
  }
  return rounded;
}

export function resolveGseTableOpenStep(
  action: GseTableOpenAction,
): number {
  if (action === 'cargos') return GSE_WIZARD_STEP.CARGOS;
  if (action === 'risks') return GSE_WIZARD_STEP.RISKS;
  if (action === 'ai') return GSE_WIZARD_STEP.AI_ANALYSIS;
  return GSE_WIZARD_STEP.DATA;
}

export type ApplyGseWizardStepDecision = {
  shouldGoToStep: boolean;
  target?: number;
  markApplied: boolean;
};

export function decideApplyGseWizardStep(params: {
  enabled: boolean;
  alreadyApplied: boolean;
  requestedStep?: number;
  activeStep: number;
  stepCount: number;
}): ApplyGseWizardStepDecision {
  if (params.alreadyApplied) {
    return { shouldGoToStep: false, markApplied: true };
  }

  if (!params.enabled) {
    return { shouldGoToStep: false, markApplied: false };
  }

  if (typeof params.requestedStep !== 'number') {
    return { shouldGoToStep: false, markApplied: true };
  }

  const target = clampGseWizardStep(params.requestedStep);
  if (target < 0 || target >= params.stepCount) {
    return { shouldGoToStep: false, markApplied: false };
  }

  if (params.activeStep === target) {
    return { shouldGoToStep: false, target, markApplied: true };
  }

  return { shouldGoToStep: true, target, markApplied: true };
}

export function getGseWizardTabOptions(params: {
  layout: GseAddLayout;
  isEdit: boolean;
}): Array<{ label: string; disabled?: boolean }> {
  if (params.layout !== 'page') {
    return [
      { label: GSE_WIZARD_TAB_LABELS.DATA },
      { label: GSE_WIZARD_TAB_LABELS.CARGOS },
    ];
  }

  const laterDisabled = !params.isEdit;
  return [
    { label: GSE_WIZARD_TAB_LABELS.DATA },
    { label: GSE_WIZARD_TAB_LABELS.CARGOS },
    { label: GSE_WIZARD_TAB_LABELS.RISKS, disabled: laterDisabled },
    { label: GSE_WIZARD_TAB_LABELS.AI_ANALYSIS, disabled: laterDisabled },
  ];
}
