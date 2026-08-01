/** Índices do Wizard em ModalAddHierarchyRisk (edição completa). */
export const CHARACTERIZATION_WIZARD_STEP = {
  DATA: 0,
  CARGOS: 1,
  /** Aba "Fatores de Riscos" */
  RISKS: 2,
  MEDIA: 3,
  /** Aba "Análise IA" — não dispara a IA automaticamente. */
  AI_ANALYSIS: 4,
  TRACEABILITY: 5,
} as const;

export type CharacterizationWizardStep =
  (typeof CHARACTERIZATION_WIZARD_STEP)[keyof typeof CHARACTERIZATION_WIZARD_STEP];
