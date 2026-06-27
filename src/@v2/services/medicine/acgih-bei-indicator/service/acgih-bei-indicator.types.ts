export enum AcgihBeiIndicatorStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
}

export enum AcgihBeiIndicatorSourceEnum {
  ACGIH_BEI = 'ACGIH_BEI',
  SIMPLE_SST = 'SIMPLE_SST',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER',
}

export enum AcgihBeiIndicatorConfidenceEnum {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface IAcgihBeiIndicator {
  id: string;
  substanceName: string;
  substanceNameNormalized: string;
  cas: string | null;
  referenceYear: number | null;
  determinant: string | null;
  biologicalMatrix: string | null;
  samplingTime: string | null;
  beiValue: string | null;
  unit: string | null;
  notation: string | null;
  status: AcgihBeiIndicatorStatusEnum;
  source: AcgihBeiIndicatorSourceEnum;
  sourceYear: number | null;
  isCurated: boolean;
  confidence: AcgihBeiIndicatorConfidenceEnum | null;
  internalNotes: string | null;
  sourcePage: string | null;
  dedupeKey: string;
  createdById: number | null;
  updatedById: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IBrowseAcgihBeiIndicatorsParams {
  page?: number;
  limit?: number;
  search?: string;
  biologicalMatrix?: string;
  status?: AcgihBeiIndicatorStatusEnum;
  confidence?: AcgihBeiIndicatorConfidenceEnum;
  source?: AcgihBeiIndicatorSourceEnum;
  onlyCurated?: boolean;
}

export interface IBrowseAcgihBeiIndicatorsResponse {
  count: number;
  data: IAcgihBeiIndicator[];
  page: number;
  limit: number;
}

export interface IUpsertAcgihBeiIndicatorPayload {
  substanceName?: string;
  cas?: string | null;
  referenceYear?: number | null;
  determinant?: string | null;
  biologicalMatrix?: string | null;
  samplingTime?: string | null;
  beiValue?: string | null;
  unit?: string | null;
  notation?: string | null;
  status?: AcgihBeiIndicatorStatusEnum;
  source?: AcgihBeiIndicatorSourceEnum;
  sourceYear?: number | null;
  isCurated?: boolean;
  confidence?: AcgihBeiIndicatorConfidenceEnum | null;
  internalNotes?: string | null;
  sourcePage?: string | null;
}

export type AcgihBeiImportClassification =
  | 'CREATE'
  | 'UPDATE'
  | 'UNCHANGED'
  | 'REJECTED'
  | 'CONFLICT'
  | 'INVALID';

export interface IAcgihBeiRowError {
  field: string;
  message: string;
}

export interface IAcgihBeiFieldChange {
  field: string;
  from: string;
  to: string;
}

export interface IAcgihBeiPreviewLine {
  rowNumber: number;
  classification: AcgihBeiImportClassification;
  id: string;
  substanceName: string;
  determinant: string | null;
  restored: boolean;
  changedFields: string[];
  fieldChanges: IAcgihBeiFieldChange[];
  warnings: string[];
  errors: IAcgihBeiRowError[];
}

export interface IAcgihBeiImportTotals {
  read: number;
  valid: number;
  create: number;
  update: number;
  unchanged: number;
  rejected: number;
  conflict: number;
  invalid: number;
}

export interface IAcgihBeiImportPreviewResult {
  fileName: string;
  totals: IAcgihBeiImportTotals;
  lines: IAcgihBeiPreviewLine[];
}

export interface IAcgihBeiImportApplyResult {
  fileName: string;
  applied: {
    created: number;
    updated: number;
    unchanged: number;
    rejected: number;
    conflict: number;
    invalid: number;
  };
  totals: IAcgihBeiImportTotals;
  affectedIds: number;
}
