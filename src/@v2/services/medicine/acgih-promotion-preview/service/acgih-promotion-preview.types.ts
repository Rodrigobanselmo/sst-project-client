/**
 * 4P.1C — tipos do preview/dry-run de promoção ACGIH/BEI → indicador oficial.
 * Alinhados 1:1 com o payload da API (4P.1B). Nenhum campo é inventado.
 */

export enum AcgihPromotionEligibilityTierEnum {
  PRIMARY = 'PRIMARY',
  DIVERGENCE_DERIVED = 'DIVERGENCE_DERIVED',
}

export enum AcgihPromotionEligibilityStatusEnum {
  ELIGIBLE = 'ELIGIBLE',
  WARNING = 'WARNING',
  BLOCKED = 'BLOCKED',
}

export enum AcgihPromotionDuplicateRiskEnum {
  NONE = 'NONE',
  ALREADY_PROMOTED = 'ALREADY_PROMOTED',
  NEAR_DUPLICATE_NR7 = 'NEAR_DUPLICATE_NR7',
  NEAR_DUPLICATE_OFFICIAL = 'NEAR_DUPLICATE_OFFICIAL',
}

export enum AcgihPromotionMomentConfidenceEnum {
  SAFE = 'SAFE',
  AMBIGUOUS = 'AMBIGUOUS',
  UNMAPPED = 'UNMAPPED',
}

export interface IAcgihPromotionMappedMoment {
  original: string | null;
  mappedValue: string | null;
  confidence: AcgihPromotionMomentConfidenceEnum;
}

export interface IAcgihPromotionProposedPayload {
  normativeSource: string;
  dataOrigin: string;
  acgihBeiIndicatorId: string;
  substanceName: string;
  substanceNameNormalized: string;
  casPrimary: string | null;
  casNumbers: string[];
  biologicalIndicatorOriginal: string;
  biologicalIndicatorNormalized: string;
  biologicalMatrix: string | null;
  collectionMoment: string | null;
  referenceValue: string | null;
  referenceValueRaw: string | null;
  unit: string | null;
  normativeVersion: string | null;
  sourcePage: string | null;
  status: string;
  requiresNormativeReview: boolean;
  occupationalApplicability: Record<string, boolean>;
  idempotencyKey: string;
}

export interface IAcgihPromotionComparisonSnapshot {
  comparisonStatus: string;
  operationalStatus: string | null;
  reviewDecision: string | null;
  reviewNote: string | null;
  hasComplementaryReference: boolean;
}

export interface IAcgihPromotionPreviewItem {
  acgihBeiIndicatorId: string;
  substanceName: string;
  cas: string | null;
  determinant: string | null;
  biologicalMatrix: string | null;
  samplingTime: string | null;
  referenceValue: string | null;
  unit: string | null;
  notation: string | null;
  sourceYear: number | null;
  proposedNormativeVersion: string | null;
  sourcePage: string | null;
  eligibilityTier: AcgihPromotionEligibilityTierEnum;
  eligibilityStatus: AcgihPromotionEligibilityStatusEnum;
  eligibilityReason: string;
  blockers: string[];
  warnings: string[];
  duplicateRisk: AcgihPromotionDuplicateRiskEnum;
  mappedFields: {
    collectionMoment: IAcgihPromotionMappedMoment;
  };
  missingFields: string[];
  proposedOfficialPayload: IAcgihPromotionProposedPayload;
  comparisonSnapshot: IAcgihPromotionComparisonSnapshot;
}

export interface IAcgihPromotionPreviewTotals {
  total: number;
  eligible: number;
  warning: number;
  blocked: number;
  primary: number;
  divergenceDerived: number;
}

export interface IAcgihPromotionPreviewParams {
  includeDivergenceDerived?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IAcgihPromotionPreviewResponse {
  totals: IAcgihPromotionPreviewTotals;
  data: IAcgihPromotionPreviewItem[];
  page: number;
  limit: number;
  count: number;
}
