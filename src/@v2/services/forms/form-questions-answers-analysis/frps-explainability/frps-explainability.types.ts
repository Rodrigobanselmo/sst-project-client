export type FrpsExplanationItemType =
  | 'SOURCE'
  | 'ENGINEERING_RECOMMENDATION'
  | 'ADMINISTRATIVE_RECOMMENDATION';

export type FrpsExplanationValidationStatus =
  | 'DRAFT_AI'
  | 'VALIDATED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type FrpsAnalysisListItemType =
  | 'fontesGeradoras'
  | 'medidasEngenhariaRecomendadas'
  | 'medidasAdministrativasRecomendadas';

export type FormAiConceptualExplanationContent = {
  definition?: string | null;
  relationToRiskFactor?: string | null;
  /** Preferencialmente string[]; string legado tolerado na UI. */
  measurableQuestions?: string[] | string | null;
  organizationalManifestations?: string | string[] | null;
  favorableSignals?: string | string[] | null;
  intermediateSignals?: string | string[] | null;
  unfavorableSignals?: string | string[] | null;
  interpretationLimits?: string | null;
  professionalValidationGuidance?: string | null;
  objective?: string | null;
  whyItMayReduceRisk?: string | null;
  implementationGuidance?: string | null;
  practicalExamples?: string | string[] | null;
  expectedResults?: string | null;
  monitoringIndicators?: string | string[] | null;
  limitationsAndCautions?: string | null;
};

export type FormAiContextualExplanationContent = {
  resumoContextual?: string | null;
  evidenciasAgregadas?: string | null;
  relacaoComFator?: string | null;
  motivoDaSelecao?: string | null;
  adequacaoDaRecomendacao?: string | null;
  leituraDoCenario?: 'FAVORAVEL' | 'INTERMEDIARIO' | 'DESFAVORAVEL' | string | null;
  limitesDeInterpretacao?: string | null;
  orientacaoDeValidacaoProfissional?: string | null;
};

export type FrpsExplainItemConceptualBlock = {
  id: string;
  itemType: FrpsExplanationItemType;
  itemKey: string;
  catalogId?: string | null;
  riskId?: string | null;
  content: FormAiConceptualExplanationContent;
  validationStatus: FrpsExplanationValidationStatus;
  methodologyVersion?: string;
  contentVersion?: number;
  promptRevision?: number | null;
  model?: string | null;
  validatedAt?: string | Date | null;
  validatedByName?: string | null;
  cached?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type FrpsExplainItemContextualReleased = {
  protectedData: false;
  id: string;
  itemType: FrpsExplanationItemType;
  itemKey: string;
  catalogId?: string | null;
  riskId?: string;
  conceptualExplanationId?: string;
  content: FormAiContextualExplanationContent;
  evidenceSummary?: {
    probability: number | null;
    severity: number | null;
    nro: number | null;
    questions?: unknown[];
  };
  participantCount?: number;
  contextHash?: string;
  analysisVersion?: string;
  methodologyVersion?: string;
  validationStatus: FrpsExplanationValidationStatus;
  promptRevision?: number | null;
  model?: string | null;
  validatedAt?: string | Date | null;
  validatedByName?: string | null;
  cached?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type FrpsExplainItemContextualProtected = {
  protectedData: true;
  itemType: FrpsExplanationItemType;
  itemKey: string;
  label: string;
  participantCount?: number;
  validationStatus?: FrpsExplanationValidationStatus;
};

export type ReadFrpsItemExplanationParams = {
  companyId: string;
  applicationId: string;
  analysisId: string;
  itemType: FrpsExplanationItemType;
  itemKey?: string;
  itemName?: string;
};

export type ReadFrpsItemExplanationResponse =
  | {
      available: false;
      reason:
        | 'ITEM_NOT_FOUND'
        | 'CONCEPTUAL_NOT_VALIDATED'
        | 'CONCEPTUAL_NOT_GENERATED'
        | 'CONTEXTUAL_NOT_GENERATED'
        | 'NOT_AVAILABLE_FOR_USER'
        | 'NOT_GENERATED';
      canGenerateContextual?: boolean;
      canGenerateConceptual?: boolean;
      conceptual?: FrpsExplainItemConceptualBlock;
    }
  | {
      available: true;
      conceptual: FrpsExplainItemConceptualBlock;
      contextual:
        | FrpsExplainItemContextualReleased
        | FrpsExplainItemContextualProtected;
    };

export type GenerateFrpsItemExplanationParams = ReadFrpsItemExplanationParams & {
  conceptualModel?: string;
};

export type GenerateFrpsItemExplanationResponse = {
  conceptual: FrpsExplainItemConceptualBlock;
  contextual:
    | FrpsExplainItemContextualReleased
    | FrpsExplainItemContextualProtected;
};
