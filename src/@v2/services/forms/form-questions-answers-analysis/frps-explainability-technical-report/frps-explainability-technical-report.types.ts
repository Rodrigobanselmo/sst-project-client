export type FrpsTechnicalReportItemType =
  | 'GENERATE_SOURCE'
  | 'REC_MED_ADMIN'
  | 'REC_MED_ENGINEERING';

export type FrpsTechnicalReportPendingReason =
  | 'NEVER_GENERATED'
  | 'DRAFT_AI'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'CUSTOM'
  | 'MISSING_CATALOG_ID'
  | 'GLOBAL_CATALOG_LINK_REQUIRED'
  | 'NO_EXPLANATION';

export type FrpsTechnicalReportRiskRef = {
  riskId: string;
  riskName: string;
};

export type FrpsTechnicalReportUsage = {
  groupingLabel: string;
  groupingValue: string;
};

export type FrpsTechnicalReportValidatedBy = {
  name: string;
  id?: number;
};

export type FrpsTechnicalReportConceptualContent = {
  definition?: string;
  relationToRiskFactor?: string;
  measurableQuestions?: string[];
  organizationalManifestations?: string;
  favorableSignals?: string;
  intermediateSignals?: string;
  unfavorableSignals?: string;
  interpretationLimits?: string;
  professionalValidationGuidance?: string;
  objective?: string;
  whyItMayReduceRisk?: string;
  implementationGuidance?: string;
  practicalExamples?: string;
  expectedResults?: string;
  monitoringIndicators?: string;
  limitationsAndCautions?: string;
};

/** Conteúdo contextual permitido (mesmos campos do drawer). */
export type FrpsTechnicalReportContextualContent = {
  resumoContextual?: string | null;
  evidenciasAgregadas?: string | null;
  relacaoComFator?: string | null;
  motivoDaSelecao?: string | null;
  adequacaoDaRecomendacao?: string | null;
  leituraDoCenario?: string | null;
  limitesDeInterpretacao?: string | null;
  orientacaoDeValidacaoProfissional?: string | null;
};

/**
 * Justificativa contextual por análise/uso.
 * Não é atributo global do canônico — cada uso traz o próprio contexto.
 */
export type FrpsTechnicalReportContextualAnalysis = {
  analysisId: string;
  riskId: string;
  riskName: string;
  hierarchyId: string;
  hierarchyLabel: string;
  /** VALIDATED ou DRAFT_AI — nunca REJECTED no relatório. */
  validationStatus: 'VALIDATED' | 'DRAFT_AI';
  content: FrpsTechnicalReportContextualContent;
  generatedAt?: string | null;
  validatedAt?: string | null;
  /** Somente nome seguro do validador (sem e-mail/documento). */
  validatedBy?: FrpsTechnicalReportValidatedBy | null;
};

export type FrpsTechnicalReportValidatedItem = {
  itemKey: string;
  canonicalCatalogId: string;
  itemType: FrpsTechnicalReportItemType;
  name: string;
  validationStatus: 'VALIDATED';
  validatedBy: FrpsTechnicalReportValidatedBy | null;
  validatedAt: string | null;
  aliasCount: number;
  risks: FrpsTechnicalReportRiskRef[];
  usages: FrpsTechnicalReportUsage[];
  content: FrpsTechnicalReportConceptualContent;
  /**
   * Zero ou mais justificativas contextuais por análise/hierarquia.
   * Ausente ou [] → PDF mantém só o conhecimento técnico.
   */
  contextualAnalyses?: FrpsTechnicalReportContextualAnalysis[];
};

export type FrpsTechnicalReportPendingItem = {
  itemType: FrpsTechnicalReportItemType;
  name: string;
  validationStatus: string | null;
  reason: FrpsTechnicalReportPendingReason;
  itemKey?: string;
  canonicalCatalogId?: string;
  risks: FrpsTechnicalReportRiskRef[];
  usages: FrpsTechnicalReportUsage[];
};

export type FrpsInventoryInclusion =
  | 'INCLUDED'
  | 'NOT_INCLUDED'
  | 'PARTIAL';

export type FrpsTechnicalReportRisk = {
  riskId: string;
  riskName: string;
  inventoryInclusion: FrpsInventoryInclusion;
  inventoriedHierarchyIds: string[];
  recorteHierarchyIds: string[];
};

export type FrpsExplainabilityTechnicalReportResult = {
  metadata: {
    companyName: string;
    formName: string;
    applicationName: string;
    methodologyVersion: string;
    emittedAt: string;
    groupingLabel: string | null;
    recorteLabel: string | null;
  };
  summary: {
    totalFrps: number;
    totalSources: number;
    totalAdministrativeMeasures: number;
    totalEngineeringMeasures: number;
    validated: number;
    pending: number;
  };
  frps: FrpsTechnicalReportRisk[];
  items: FrpsTechnicalReportValidatedItem[];
  pendingItems: FrpsTechnicalReportPendingItem[];
};

export type ReadFrpsExplainabilityTechnicalReportParams = {
  companyId: string;
  applicationId: string;
  hierarchyIds?: string[];
  groupingLabel?: string | null;
  recorteLabel?: string | null;
};
