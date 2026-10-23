export enum CompanyExamRiskCoverageStatusEnum {
  COMPLETE = 'COMPLETE',
  MISSING_RECOMMENDED_EXAMS = 'MISSING_RECOMMENDED_EXAMS',
  NO_LIBRARY_RECOMMENDATION = 'NO_LIBRARY_RECOMMENDATION',
  LOCAL_ONLY = 'LOCAL_ONLY',
  MIXED = 'MIXED',
}

export type ICompanyExamRiskCoverageGroup = {
  id?: string;
  name: string;
};

export type IPcmsoComparableConfig = {
  isAdmission: boolean;
  isPeriodic: boolean;
  isChange: boolean;
  isReturn: boolean;
  isDismissal: boolean;
  isMale: boolean;
  isFemale: boolean;
  fromAge: number | null;
  toAge: number | null;
  validityInMonths: number | null;
  considerBetweenDays: number | null;
  minRiskDegree: number | null;
  minRiskDegreeQuantity: number | null;
};

export type ICompanyExamRiskCoverageExamSummary = {
  examId: number;
  examName: string;
  linkId?: number | null;
  isRecommendedByLibrary: boolean;
  isLocalOnly: boolean;
  isAdopted: boolean;
  isMissing: boolean;
  adoptionState?: 'ADOPTED' | 'PENDING' | 'NOT_ADOPTED';
  nonAdoptionDecision?: {
    fingerprint: string; version: string | null; active: boolean; valid: boolean;
    reason: string | null; actorUserId: number | null; decidedAt: string | null; snapshot: unknown;
  } | null;
  config: IPcmsoComparableConfig | null;
  notes?: string[];
  recommendationSource?: { ruleId: string; ruleExamId: string; ruleUpdatedAt: string; itemUpdatedAt: string } | null;
  matchedAdoptedLinks?: Array<{ examId: number; linkId: number }>;
};

export type ICompanyExamRiskCoverageItem = {
  quantitativeLimitApplicable?: boolean;
  riskId: string;
  riskName: string;
  riskGroup: ICompanyExamRiskCoverageGroup;
  riskSubgroup: ICompanyExamRiskCoverageGroup | null;
  coverageStatus: CompanyExamRiskCoverageStatusEnum;
  adoptedExams: ICompanyExamRiskCoverageExamSummary[];
  recommendedExams: ICompanyExamRiskCoverageExamSummary[];
  missingRecommendedExams: ICompanyExamRiskCoverageExamSummary[];
  localOnlyExams: ICompanyExamRiskCoverageExamSummary[];
  hasAnyAdoptedExam: boolean;
  hasAnyRecommendation: boolean;
  adoptedCount: number;
  notAdoptedCount?: number;
  recommendedCount: number;
  missingCount: number;
  localOnlyCount: number;
};

export type ICompanyExamRiskCoverageSummary = {
  totalRisksAnalyzed: number;
  notAdoptedExams?: number;
  complete: number;
  missingRecommendedExams: number;
  noLibraryRecommendation: number;
  localOnly: number;
  mixed: number;
  recommendedWithoutAdoptedExam: number;
};

export type ICompanyExamRiskCoverageMeta = {
  companyId: string;
  workspaceId?: string;
  generatedAt: string;
  nonAdoptionDecisionsApplied?: boolean;
  onlyPcmso: boolean;
  truncated: boolean;
  truncationMessage?: string;
};

export type ICompanyExamRiskCoverageResponse = {
  summary: ICompanyExamRiskCoverageSummary;
  items: ICompanyExamRiskCoverageItem[];
  page: number;
  limit: number;
  count: number;
  meta: ICompanyExamRiskCoverageMeta;
};

export type IBrowseCompanyExamRiskCoverageParams = {
  companyId: string;
  page?: number;
  limit?: number;
  search?: string;
  workspaceId?: string;
  coverageStatus?: CompanyExamRiskCoverageStatusEnum;
  riskType?: string;
  riskSubTypeId?: number;
  pendingOnly?: boolean;
  onlyPcmso?: boolean;
};

export type IFetchCompanyExamRiskCoverageDetailParams = {
  companyId: string;
  riskId: string;
  workspaceId?: string;
  onlyPcmso?: boolean;
};
