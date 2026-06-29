import {
  AcgihBeiIndicatorConfidenceEnum,
  AcgihBeiIndicatorStatusEnum,
} from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';

export enum AcgihBeiComparisonStatusEnum {
  ALREADY_COVERED = 'ALREADY_COVERED',
  DIVERGENT = 'DIVERGENT',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  NEW_CANDIDATE = 'NEW_CANDIDATE',
  LOW_CONFIDENCE_REVIEW = 'LOW_CONFIDENCE_REVIEW',
}

/** 4O.3/4O.4 — status operacional/efetivo (comparisonStatus + decisão técnica). */
export enum AcgihBeiOperationalStatusEnum {
  ALREADY_COVERED = 'ALREADY_COVERED',
  DIVERGENT = 'DIVERGENT',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  NEW_CANDIDATE = 'NEW_CANDIDATE',
  LOW_CONFIDENCE_REVIEW = 'LOW_CONFIDENCE_REVIEW',
  RESOLVED_EQUIVALENCE = 'RESOLVED_EQUIVALENCE',
  // 4O.4 — estados operacionais derivados da decisão técnica em linhas revisadas.
  REAL_DIVERGENCE = 'REAL_DIVERGENCE',
  SOURCE_ACGIH_ERROR = 'SOURCE_ACGIH_ERROR',
  SOURCE_NR7_ERROR = 'SOURCE_NR7_ERROR',
  NEEDS_FURTHER_REVIEW = 'NEEDS_FURTHER_REVIEW',
  IGNORE_MONITOR = 'IGNORE_MONITOR',
}

export enum AcgihBeiSuggestedActionEnum {
  ADD_REFERENCE_ONLY = 'ADD_REFERENCE_ONLY',
  REVIEW_DIVERGENCE = 'REVIEW_DIVERGENCE',
  CREATE_NEW_RULE_CANDIDATE = 'CREATE_NEW_RULE_CANDIDATE',
  IGNORE_OR_MONITOR = 'IGNORE_OR_MONITOR',
  LOW_CONFIDENCE_REVIEW = 'LOW_CONFIDENCE_REVIEW',
}

export enum AcgihBeiMatchStatusEnum {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  NONE = 'NONE',
}

/** 4O.1 — decisão técnica de curadoria sobre a linha da comparação. */
export enum AcgihBeiComparisonDecisionEnum {
  FALSE_DIVERGENCE_EQUIVALENT = 'FALSE_DIVERGENCE_EQUIVALENT',
  REAL_DIVERGENCE = 'REAL_DIVERGENCE',
  SOURCE_ACGIH_ERROR = 'SOURCE_ACGIH_ERROR',
  SOURCE_NR7_ERROR = 'SOURCE_NR7_ERROR',
  NEEDS_FURTHER_REVIEW = 'NEEDS_FURTHER_REVIEW',
  IGNORE_MONITOR = 'IGNORE_MONITOR',
}

export interface IComparisonReviewInfo {
  id: string;
  decision: AcgihBeiComparisonDecisionEnum;
  technicalNote: string;
  comparisonStatusSnapshot: string;
  suggestedActionSnapshot: string | null;
  isStale: boolean;
  reviewedById: number | null;
  reviewedByName: string | null;
  reviewedAt: string;
}

export interface IAcgihBeiComparisonRow {
  acgihBeiId: string;
  substanceName: string;
  cas: string | null;
  determinant: string | null;
  biologicalMatrix: string | null;
  samplingTime: string | null;
  beiValue: string | null;
  unit: string | null;
  confidence: AcgihBeiIndicatorConfidenceEnum | null;
  nr7MatchStatus: AcgihBeiMatchStatusEnum;
  nr7IndicatorId: string | null;
  nr7SubstanceName: string | null;
  nr7IndicatorName: string | null;
  examRiskRuleMatchStatus: AcgihBeiMatchStatusEnum;
  examRiskRuleId: string | null;
  examRiskRuleSource: string | null;
  examNameSnapshot: string | null;
  ruleMatchMethod: 'VIA_NR7' | 'VIA_AGENT' | null;
  comparisonStatus: AcgihBeiComparisonStatusEnum;
  // 4O.3 — status operacional/efetivo derivado. Quando ausente, usar comparisonStatus.
  operationalStatus?: AcgihBeiOperationalStatusEnum;
  suggestedAction: AcgihBeiSuggestedActionEnum;
  technicalDiff: string;
  reviewNotes: string;
  // 4L.1a — contexto de curadoria/readiness (read-only).
  acgihBeiStatus?: AcgihBeiIndicatorStatusEnum | string | null;
  acgihBeiIsCurated?: boolean | null;
  acgihBeiSourceYear?: number | null;
  acgihBeiSourcePage?: string | null;
  nr7Status?: string | null;
  nr7PendencyCount?: number | null;
  nr7PendencyCodes?: string[] | null;
  examRiskRuleStatus?: string | null;
  examRiskRuleIsCurated?: boolean | null;
  // Estado persistente da fonte complementar (Fase 4I).
  hasComplementaryReference?: boolean;
  complementaryReferenceId?: string | null;
  complementaryReferenceStatus?: string | null;
  // 4O.1 — decisão técnica de curadoria (camada sobre o cálculo).
  review?: IComparisonReviewInfo | null;
  hasReview?: boolean;
}

export interface IAcgihBeiComparisonTotals {
  total: number;
  alreadyCovered: number;
  divergent: number;
  needsReview: number;
  newCandidate: number;
  lowConfidenceReview: number;
  // 4O.3 — divergências resolvidas por equivalência técnica.
  resolvedEquivalence: number;
}

export interface IBrowseAcgihBeiComparisonParams {
  page?: number;
  limit?: number;
  search?: string;
  comparisonStatus?: AcgihBeiComparisonStatusEnum;
  // 4O.3 — filtro pelo status operacional/efetivo.
  operationalStatus?: AcgihBeiOperationalStatusEnum;
  suggestedAction?: AcgihBeiSuggestedActionEnum;
  confidence?: AcgihBeiIndicatorConfidenceEnum;
  // 4O.1 — filtros pela decisão técnica.
  reviewDecision?: AcgihBeiComparisonDecisionEnum;
  hasReview?: 'true' | 'false';
}

export interface IBrowseAcgihBeiComparisonResponse {
  totals: IAcgihBeiComparisonTotals;
  data: IAcgihBeiComparisonRow[];
  page: number;
  limit: number;
  count: number;
}

export type ApplyAcgihReferenceOutcome = 'CREATED' | 'RESTORED' | 'UNCHANGED';

export interface IApplyAcgihReferencePayload {
  acgihBeiIndicatorId: string;
}

export interface IApplyAcgihReferenceResponse {
  outcome: ApplyAcgihReferenceOutcome;
  reference: {
    id: string;
    ruleId: string;
    sourceType: string;
    acgihBeiIndicatorId: string | null;
    referenceLabel: string | null;
    referenceYear: number | null;
    status: string;
  };
}

export type UpsertComparisonReviewOutcome = 'CREATED' | 'UPDATED' | 'RESTORED';

export interface IUpsertComparisonReviewPayload {
  acgihBeiIndicatorId: string;
  decision: AcgihBeiComparisonDecisionEnum;
  technicalNote: string;
}

export interface IUpsertComparisonReviewResponse {
  outcome: UpsertComparisonReviewOutcome;
  review: {
    id: string;
    acgihBeiIndicatorId: string;
    decision: AcgihBeiComparisonDecisionEnum;
    technicalNote: string;
  };
}

export interface IRemoveComparisonReviewResponse {
  acgihBeiIndicatorId: string;
  removed: boolean;
}

/** 4O.2 — sugestão de decisão técnica assistida por IA (rascunho, não gravada). */
export interface IComparisonAiSuggestionResponse {
  decisionSuggestion: AcgihBeiComparisonDecisionEnum;
  confidence: 'low' | 'medium' | 'high';
  rationale: string;
  matchedFields: string[];
  divergentFields: string[];
  suggestedTechnicalNote: string;
  warnings: string[];
}
