/** Índices do Wizard em ModalAddHierarchyRisk (edição completa). */
export const CHARACTERIZATION_WIZARD_STEP = {
  DATA: 0,
  CARGOS: 1,
  MEDIA: 2,
  TRACEABILITY: 3,
  /** Aba "Fatores de Riscos" */
  RISKS: 4,
  /** Aba "Análise de Riscos IA" — não dispara a IA automaticamente. */
  AI_ANALYSIS: 5,
} as const;

export type CharacterizationWizardStep =
  (typeof CHARACTERIZATION_WIZARD_STEP)[keyof typeof CHARACTERIZATION_WIZARD_STEP];

export const CHARACTERIZATION_WIZARD_TAB_LABELS = {
  DATA: 'Dados',
  CARGOS: 'Cargos',
  MEDIA: 'Áudios e Vídeos',
  TRACEABILITY: 'Rastreabilidade Técnica',
  RISKS: 'Fatores de Riscos',
  AI_ANALYSIS: 'Análise de Riscos IA',
} as const;

export const CHARACTERIZATION_WIZARD_TAB_ORDER = [
  CHARACTERIZATION_WIZARD_TAB_LABELS.DATA,
  CHARACTERIZATION_WIZARD_TAB_LABELS.CARGOS,
  CHARACTERIZATION_WIZARD_TAB_LABELS.MEDIA,
  CHARACTERIZATION_WIZARD_TAB_LABELS.TRACEABILITY,
  CHARACTERIZATION_WIZARD_TAB_LABELS.RISKS,
  CHARACTERIZATION_WIZARD_TAB_LABELS.AI_ANALYSIS,
] as const;
