export type CatalogOnlyAiIdentificationEntityKind =
  | 'GSE'
  | 'CHARACTERIZATION';

export type CatalogOnlyAiIdentificationItemClassification =
  | 'NEW'
  | 'ALREADY_LINKED';

export type CatalogOnlyAiIdentificationRunItem = {
  riskId: string;
  name: string;
  type: string;
  explanation: string;
  confidence: number;
  classification: CatalogOnlyAiIdentificationItemClassification;
  suggestionOrigin?: string;
  technicalConsideration?: string;
};

export type CatalogOnlyAiIdentificationRunRecord = {
  id: string;
  companyId: string;
  workspaceId: string;
  entityKind: CatalogOnlyAiIdentificationEntityKind;
  entityId: string;
  model: string;
  userGuidancePresent: boolean;
  selectedImageCount: number;
  imagesSentToModelCount: number;
  imageFallbackTextOnly: boolean;
  items: CatalogOnlyAiIdentificationRunItem[];
  metadata: Record<string, unknown> | null;
  createdAt: string;
  createdBy: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
};

export type BrowseCatalogOnlyAiIdentificationHistoryResult = {
  results: CatalogOnlyAiIdentificationRunRecord[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
};

export type BrowseCatalogOnlyAiIdentificationHistoryParams = {
  companyId: string;
  workspaceId: string;
  entityKind: CatalogOnlyAiIdentificationEntityKind;
  entityId: string;
  page?: number;
};
