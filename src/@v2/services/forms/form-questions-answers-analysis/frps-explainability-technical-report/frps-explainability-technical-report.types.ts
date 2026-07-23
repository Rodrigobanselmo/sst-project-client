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
