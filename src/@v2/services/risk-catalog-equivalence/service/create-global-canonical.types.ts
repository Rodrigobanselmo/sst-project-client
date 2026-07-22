import type {
  RiskCatalogEquivalenceType,
  RiskCatalogKind,
} from './risk-catalog-equivalence.types';

export type CreateGlobalCanonicalFromLocalParams = {
  kind: RiskCatalogKind;
  riskId: string;
  baseAliasId: string;
  aliasIds: string[];
  equivalenceType?: RiskCatalogEquivalenceType;
};

export type CreateGlobalCanonicalFromLocalResult = {
  canonicalId: string;
  equivalenceIds: string[];
  aliasCount: number;
};
