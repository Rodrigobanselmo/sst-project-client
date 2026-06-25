export type BiologicalIndicatorStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'REVOKED';

export type BiologicalIndicatorTable = 'QUADRO_1' | 'QUADRO_2';

export type BiologicalIndicatorType = 'IBE_EE' | 'IBE_SC';

export type BiologicalIndicatorPendency = {
  code: string;
  message: string;
};

export type BiologicalIndicatorRiskLink = {
  id: string;
  isConfirmed: boolean;
  isPrimary: boolean;
  requiresReview: boolean;
  matchConfidence: string;
  matchMethod: string;
  riskNameSnapshot: string;
  riskCasSnapshot: string | null;
  notes?: string | null;
  confirmedAt?: string | null;
  riskFactor: {
    id: string;
    name: string;
    cas: string | null;
    type?: string;
    system?: boolean;
  };
  confirmedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type BiologicalIndicatorExamLink = {
  id: string;
  isConfirmed: boolean;
  isDefault: boolean;
  requiresReview: boolean;
  matchConfidence: string;
  matchMethod: string;
  examNameSnapshot: string;
  examMaterialSnapshot: string | null;
  notes?: string | null;
  confirmedAt?: string | null;
  exam: {
    id: number;
    name: string;
    material: string | null;
    analyses?: string | null;
    instruction?: string | null;
    type?: string | null;
    system?: boolean;
    esocial27Code?: string | null;
  };
  confirmedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type BiologicalIndicatorListItem = {
  id: string;
  substanceName: string;
  casNumbers: string[];
  casPrimary: string | null;
  biologicalIndicatorOriginal: string;
  biologicalIndicatorNormalized: string;
  biologicalMatrix: string;
  collectionMoment: string;
  tableNumber: BiologicalIndicatorTable;
  indicatorType: BiologicalIndicatorType;
  referenceValue: string;
  unit: string;
  technicalObservations: string[];
  status: BiologicalIndicatorStatus;
  requiresNormativeReview: boolean;
  isSubstanceGroup: boolean;
  reviewedAt: string | null;
  substanceGroup?: {
    id: string;
    name: string;
    groupType: string;
  } | null;
  riskLinks: BiologicalIndicatorRiskLink[];
  examLinks: BiologicalIndicatorExamLink[];
  pendencies: BiologicalIndicatorPendency[];
};

export type BiologicalIndicatorDetail = BiologicalIndicatorListItem & {
  normativeSource?: string;
  annex?: string;
  technicalObservationsRaw?: string | null;
  generalApplicabilityNotes?: string | null;
  defaultValidityMonths?: number | null;
  collectionToleranceDays?: number | null;
  occupationalApplicability?: unknown;
  reviewNotes?: string | null;
  reviewedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type BrowseBiologicalIndicatorsParams = {
  page?: number;
  limit?: number;
  search?: string;
  substanceName?: string;
  cas?: string;
  tableNumber?: BiologicalIndicatorTable;
  indicatorType?: BiologicalIndicatorType;
  status?: BiologicalIndicatorStatus;
  requiresNormativeReview?: boolean;
  isSubstanceGroup?: boolean;
  hasConfirmedRisk?: boolean;
  hasConfirmedExam?: boolean;
  hasPendency?: boolean;
};

export type BrowseBiologicalIndicatorsResponse = {
  count: number;
  data: BiologicalIndicatorListItem[];
  page: number;
  limit: number;
};

export type ExamCandidate = {
  id: number;
  name: string;
  material: string | null;
  analyses: string | null;
  instruction: string | null;
  type: string | null;
  system: boolean;
  esocial27Code: string | null;
};

export type SearchExamCandidatesParams = {
  search?: string;
  material?: string;
  limit?: number;
};

export type CreateExamLinkParams = {
  indicatorId: string;
  examId: number;
  notes?: string;
};

export type UpdateIndicatorStatusParams = {
  indicatorId: string;
  status: BiologicalIndicatorStatus;
  reviewNotes?: string;
};

export type CurationNotesParams = {
  linkId: string;
  notes?: string;
};

export type ImportPreviewClassification =
  | 'UNCHANGED'
  | 'NEW'
  | 'UPDATED'
  | 'DEPRECATED_CANDIDATE'
  | 'INVALID'
  | 'CONFLICT';

export type ImportPreviewAnchor = 'indicatorId' | 'idempotencyKey' | 'none';

export type ImportPreviewRowError = {
  field: string;
  message: string;
};

export type ImportPreviewFieldChange = {
  field: string;
  from: string;
  to: string;
};

export type ImportPreviewLine = {
  rowNumber: number;
  classification: ImportPreviewClassification;
  anchorUsed: ImportPreviewAnchor;
  indicatorId: string | null;
  idempotencyKey: string | null;
  substanceName: string;
  changedFields: string[];
  fieldChanges: ImportPreviewFieldChange[];
  errors: ImportPreviewRowError[];
};

export type ImportPreviewTotals = {
  read: number;
  valid: number;
  invalid: number;
  new: number;
  updated: number;
  unchanged: number;
  deprecatedCandidate: number;
  conflict: number;
};

export type ImportPreviewResult = {
  fileName: string;
  totals: ImportPreviewTotals;
  lines: ImportPreviewLine[];
  deprecatedCandidates: Array<{ indicatorId: string; substanceName: string }>;
};
