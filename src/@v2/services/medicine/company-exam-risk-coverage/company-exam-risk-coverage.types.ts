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
  config: IPcmsoComparableConfig | null;
  notes?: string[];
};

export type ICompanyExamRiskCoverageItem = {
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
  recommendedCount: number;
  missingCount: number;
  localOnlyCount: number;
};

export type ICompanyExamRiskCoverageSummary = {
  totalRisksAnalyzed: number;
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
