export type RiskFactorEquivalenceType =
  | 'TECHNICAL_DUPLICATE'
  | 'SEMANTIC_ALIAS';

export type SystemRiskSearchItem = {
  id: string;
  name: string;
  type: string;
  cas: string | null;
  esocialCode: string | null;
  system: boolean;
};

export type RiskFactorEquivalence = {
  id: string;
  companyId: string;
  aliasRiskId: string;
  canonicalRiskId: string;
  equivalenceType: RiskFactorEquivalenceType;
  aliasLabel: string;
  canonicalLabel: string;
  revokedAt: string | null;
};

export type BrowseRiskFactorEquivalencesParams = {
  companyId: string;
  aliasRiskId: string;
  includeRevoked?: boolean;
};

export type SearchSystemRisksParams = {
  search?: string;
  type?: string;
  limit?: number;
};

export type RiskFactorEquivalencePayload = {
  canonicalRiskId: string;
  equivalenceType: RiskFactorEquivalenceType;
};
