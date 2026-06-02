export enum RiskCatalogKind {
  GENERATE_SOURCE = 'GENERATE_SOURCE',
  REC_MED = 'REC_MED',
}

export enum RiskCatalogEquivalenceType {
  TECHNICAL_DUPLICATE = 'TECHNICAL_DUPLICATE',
  SEMANTIC_ALIAS = 'SEMANTIC_ALIAS',
}

export type RiskCatalogSearchItem = {
  id: string;
  kind: RiskCatalogKind;
  label: string;
  riskId: string;
  riskName: string;
  companyId: string;
  companyName: string;
  system: boolean;
  deleted_at: string | null;
  name?: string;
  recName?: string | null;
  medName?: string | null;
  recType?: string | null;
  medType?: string | null;
  isAliasActive: boolean;
  canonicalId: string | null;
  canonicalLabel: string | null;
};

export type RiskCatalogEquivalence = {
  id: string;
  kind: RiskCatalogKind;
  equivalenceType: RiskCatalogEquivalenceType;
  riskId: string;
  canonicalId: string;
  aliasId: string;
  canonicalLabel: string;
  aliasLabel: string;
  normalizedKey: string | null;
  confirmedById: number | null;
  confirmedAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type RiskCatalogGenerateSourceImpactPreview = {
  riskFactorDataWithAlias: number;
  riskFactorDataWithCanonical: number;
  riskFactorDataDuplicateIfMigrated: number;
  m2mLinksWithAlias: number;
};

export type RiskCatalogRecMedImpactPreview = {
  recMedOnRiskDataWithAlias: number;
  engsToRiskFactorDataWithAlias: number;
  admsM2mLinksWithAlias: number;
  riskFactorDataRecWithAlias: number;
  riskFactorDataRecDerivedMeasureWithAlias: number;
  characterizationPhotoRecommendationsWithAlias: number;
  riskFactorDataWithCanonicalAnyLink: number;
  riskFactorDataDuplicateIfMigrated: number;
};

export type RiskCatalogImpactPreview =
  | {
      kind: RiskCatalogKind.GENERATE_SOURCE;
      riskId: string;
      canonicalId: string;
      aliasId: string;
      generateSource: RiskCatalogGenerateSourceImpactPreview;
    }
  | {
      kind: RiskCatalogKind.REC_MED;
      riskId: string;
      canonicalId: string;
      aliasId: string;
      recMed: RiskCatalogRecMedImpactPreview;
    };

export type SearchRiskCatalogItemsParams = {
  kind: RiskCatalogKind;
  companyId?: string;
  riskId?: string;
  search?: string;
  includeSystem?: boolean;
  includeDeleted?: boolean;
};

export type BrowseRiskCatalogEquivalencesParams = {
  kind?: RiskCatalogKind;
  riskId?: string;
  canonicalId?: string;
  aliasId?: string;
  includeRevoked?: boolean;
};

export type PreviewRiskCatalogEquivalenceImpactParams = {
  kind: RiskCatalogKind;
  riskId: string;
  canonicalId: string;
  aliasId: string;
};

export type CreateRiskCatalogEquivalenceParams = {
  kind: RiskCatalogKind;
  equivalenceType: RiskCatalogEquivalenceType;
  riskId: string;
  canonicalId: string;
  aliasId: string;
  normalizedKey?: string;
  metadata?: Record<string, unknown>;
};

export type RevokeRiskCatalogEquivalenceParams = {
  id: string;
  revokeReason: string;
};
