export type FrpsLibraryKind = 'SOURCE' | 'RECOMMENDATION';

export type FrpsLibraryConceptualStatus =
  | 'NEVER_GENERATED'
  | 'DRAFT_AI'
  | 'VALIDATED'
  | 'REJECTED';

export type FrpsLibraryItemType =
  | 'SOURCE'
  | 'ENGINEERING_RECOMMENDATION'
  | 'ADMINISTRATIVE_RECOMMENDATION';

export type FrpsLibraryRiskSubType = {
  id: number;
  name: string;
  slug: string;
  subTypeEnum: string | null;
};

export type FrpsLibraryBrowseItem = {
  systemCatalogId: string;
  itemKey: string;
  itemType: FrpsLibraryItemType;
  name: string;
  riskId: string;
  riskName: string;
  riskType: string;
  riskSubType: FrpsLibraryRiskSubType | null;
  recType: 'ENG' | 'ADM' | null;
  conceptualStatus: FrpsLibraryConceptualStatus;
  conceptualExplanationId: string | null;
  validatedByName: string | null;
  validatedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type FrpsLibrarySummary = {
  totalSources: number;
  validatedSources: number;
  totalRecommendations: number;
  validatedRecommendations: number;
  totalValidated: number;
  totalPending: number;
  totalDraft: number;
  totalRejected: number;
  totalNeverGenerated: number;
  coveragePercent: number;
};

export type FrpsLibraryFilterOptions = {
  categories: Array<{ value: string; label: string }>;
  subtypes: Array<{
    id: number;
    name: string;
    slug: string;
    subTypeEnum: string | null;
    riskType: string;
  }>;
  risks: Array<{
    id: string;
    name: string;
    riskType: string;
    subTypeIds: number[];
  }>;
};

export type FrpsLibraryBrowseResult = {
  summary: FrpsLibrarySummary;
  defaults: {
    riskType: string;
    riskSubTypeEnum: string;
  };
  activeScope: {
    riskType: string | null;
    riskSubTypeEnum: string | null;
    riskSubTypeId: number | null;
    riskId: string | null;
    kind: FrpsLibraryKind | null;
    status: FrpsLibraryConceptualStatus | null;
    search: string | null;
    generalCatalog: boolean;
  };
  scopeLabel: string;
  filterOptions: FrpsLibraryFilterOptions;
  items: FrpsLibraryBrowseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BrowseFrpsExplainabilityLibraryParams = {
  riskType?: string;
  riskSubTypeEnum?: string;
  riskSubTypeId?: number;
  riskId?: string;
  kind?: FrpsLibraryKind;
  status?: FrpsLibraryConceptualStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'riskName' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  generalCatalog?: boolean;
};

export type FrpsLibraryValidationStatus =
  | 'DRAFT_AI'
  | 'VALIDATED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type FrpsLibraryConceptualContent = {
  definition?: string | null;
  relationToRiskFactor?: string | null;
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

export type GenerateFrpsLibraryConceptualParams = {
  systemCatalogId: string;
  itemType: FrpsLibraryItemType;
  conceptualModel?: string;
};

export type GenerateFrpsLibraryConceptualResult = {
  id: string;
  itemType: FrpsLibraryItemType;
  itemKey: string;
  catalogId: string | null;
  riskId: string | null;
  content: FrpsLibraryConceptualContent;
  validationStatus: FrpsLibraryValidationStatus;
  methodologyVersion: string;
  contentVersion: number;
  promptRevision: number | null;
  model: string | null;
  cached: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReadFrpsConceptualExplanationByIdResult = {
  id: string;
  itemType: FrpsLibraryItemType;
  itemKey: string;
  catalogId: string | null;
  contentKey: string | null;
  riskId: string | null;
  riskFactor: { id: string; name: string } | null;
  content: FrpsLibraryConceptualContent;
  validationStatus: FrpsLibraryValidationStatus;
  methodologyVersion: string;
  locale: string;
  contentVersion: number;
  promptRevision: number | null;
  model: string | null;
  generatedByUser: { id: number; name: string } | null;
  validatedByUser: { id: number; name: string } | null;
  validatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
