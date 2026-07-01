import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

export enum RiskSubtypeCurationFilterEnum {
  ALL = 'ALL',
  NONE = 'NONE',
  SPECIFIC = 'SPECIFIC',
}

export type ICurationRiskItem = {
  riskFactorId: string;
  name: string;
  type: RiskTypeEnum;
  cas: string | null;
  esocialCode: string | null;
  subTypes: { id: number; name: string }[];
  status: StatusEnum;
  isPCMSO: boolean;
};

export type IBrowseCurationRisksParams = {
  page?: number;
  limit?: number;
  type?: RiskTypeEnum;
  search?: string;
  status?: StatusEnum;
  onlyPcmso?: boolean;
  subtypeFilter?: RiskSubtypeCurationFilterEnum;
  subtypeId?: number;
};

export type IBrowseCurationRisksResponse = {
  results: ICurationRiskItem[];
  pagination: { page: number; limit: number; total: number };
};

export type IBulkRiskSubtypeResult = {
  totalRequested: number;
  updated: number;
  skipped: number;
  errors: { riskFactorId: string; message: string }[];
};

export type ISuggestRiskSubtypeCandidatesParams = {
  type: RiskTypeEnum;
  subTypeId: number;
  onlyPcmso?: boolean;
  search?: string;
  maxCandidates?: number;
};

export type IRiskSubtypeCurationSuggestCandidate = {
  riskFactorId: string;
  name: string;
  cas: string | null;
  esocialCode: string | null;
  currentSubTypes: { id: number; name: string }[];
  suggestedInclude: boolean;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
  warnings: string[];
  defaultSelected: boolean;
  reasonCategory?:
    | 'STRUCTURAL_MATCH'
    | 'NAME_SYNONYM_MATCH'
    | 'INSUFFICIENT_DATA'
    | 'NOT_A_MATCH'
    | 'AMBIGUOUS';
  chemicalIdentity?: {
    sources: string[];
    matchedBy?: 'CAS' | 'NAME' | 'SYNONYM';
    title?: string;
    molecularFormula?: string;
    classHints?: string[];
    externalConfidence?: 'high' | 'medium' | 'low';
    warnings?: string[];
  };
};

export type ISuggestRiskSubtypeCandidatesResponse = {
  targetSubType: {
    id: number;
    name: string;
    description: string | null;
    type: RiskTypeEnum;
    status: StatusEnum;
  };
  scope: {
    analyzed: number;
    eligibleTotal: number;
    truncated: boolean;
    onlyPcmso: boolean;
    search?: string | null;
    maxCandidates?: number;
  };
  summary: {
    suggestedInclude: number;
    suggestedExclude: number;
    lowConfidence: number;
    includedWithConfidence?: number;
    excludedWithConfidence?: number;
  };
  candidates: IRiskSubtypeCurationSuggestCandidate[];
  warnings: string[];
  model: string;
  generatedAt: string;
  enrichment?: {
    attempted: number;
    enriched: number;
    failed: number;
    sources: string[];
  };
};
