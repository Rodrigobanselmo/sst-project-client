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
