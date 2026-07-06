export enum PcmsoLinkStatusEnum {
  OK = 'OK',
  ADJUSTMENT_RECOMMENDED = 'ADJUSTMENT_RECOMMENDED',
  RISK_NOT_CHARACTERIZED = 'RISK_NOT_CHARACTERIZED',
  NO_LIBRARY_REFERENCE = 'NO_LIBRARY_REFERENCE',
}

export enum ExamRiskCharacterizationStatusEnum {
  IN_CHARACTERIZATION = 'IN_CHARACTERIZATION',
  OUT_OF_CHARACTERIZATION = 'OUT_OF_CHARACTERIZATION',
}

export enum ExamRiskLibraryStatusEnum {
  OK = 'OK',
  NO_LIBRARY_RULE = 'NO_LIBRARY_RULE',
  EXAM_NOT_RECOMMENDED = 'EXAM_NOT_RECOMMENDED',
  MISSING_RECOMMENDED_EXAMS = 'MISSING_RECOMMENDED_EXAMS',
  INDIRECT_BIOLOGICAL_ONLY = 'INDIRECT_BIOLOGICAL_ONLY',
}

export enum CompanyExamRiskLibraryCoverageEnum {
  MATCHED_BY_RULE = 'MATCHED_BY_RULE',
  BIOLOGICAL_INDIRECT_ONLY = 'BIOLOGICAL_INDIRECT_ONLY',
  NO_GLOBAL_REFERENCE = 'NO_GLOBAL_REFERENCE',
}

export type IExamRiskLinkRecommendedExam = {
  examId: number;
  examName: string;
  primaryRuleId: string;
  matchReason: string;
};

export type IExamRiskLinkMissingExam = {
  examId: number;
  examName: string;
};

export type IExamRiskLinkMatchedRule = {
  ruleId: string;
  ruleScope: string;
  ruleSource: string;
  ruleStatus: 'ACTIVE';
  matchReason: string;
  referenceLabels: string[];
};

export type IExamRiskLinkStatusItem = {
  linkId: number;
  riskId: string;
  examId: number;
  pcmsoStatus: PcmsoLinkStatusEnum;
  severityOrder: 1 | 2 | 3 | 4;
  message: string;
  recommendedExams: IExamRiskLinkRecommendedExam[];
  missingRecommendedExams: IExamRiskLinkMissingExam[];
  nonRecommendedLink: boolean;
  libraryCoverage: CompanyExamRiskLibraryCoverageEnum;
  libraryCoverageNotes: string[];
  matchedRules: IExamRiskLinkMatchedRule[];
  isRiskCharacterized?: boolean;
  characterizationStatus?: ExamRiskCharacterizationStatusEnum;
  libraryStatus?: ExamRiskLibraryStatusEnum;
  hasActiveLibraryRule?: boolean;
  isLinkedExamRecommended?: boolean;
  risk: {
    id: string;
    name: string;
    type: string;
    isPcmso: boolean;
  };
  exam: {
    id: number;
    name: string;
  };
};

export type IExamRiskLinkStatusSummary = {
  totalLinks: number;
  ok: number;
  adjustmentRecommended: number;
  riskNotCharacterized: number;
  noLibraryReference: number;
  risksWithPendingIssues: number;
};

export type IExamRiskCharacterizationSummary = {
  outOfCharacterization: number;
};

export type IExamRiskLibrarySummary = {
  ok: number;
  noLibraryRule: number;
  examNotRecommended: number;
  missingRecommendedExams: number;
  indirectBiologicalOnly?: number;
};

export type IExamRiskUncoveredRiskItem = {
  riskId: string;
  riskName: string;
  riskType?: string;
  workspaceId?: string;
  libraryCoverage: CompanyExamRiskLibraryCoverageEnum.NO_GLOBAL_REFERENCE;
  reason: string;
};

export type IExamRiskLinkStatusResponse = {
  items: IExamRiskLinkStatusItem[];
  uncoveredRisks: IExamRiskUncoveredRiskItem[];
  summary: IExamRiskLinkStatusSummary;
  characterizationSummary?: IExamRiskCharacterizationSummary;
  librarySummary?: IExamRiskLibrarySummary;
  meta: {
    companyId: string;
    workspaceId: string | null;
    onlyPcmso: boolean;
    generatedAt: string;
    truncated: boolean;
    truncationMessage?: string;
    linkCount: number;
    characterizedRiskCount: number;
  };
};

export type IBrowseExamRiskLinkStatusParams = {
  companyId: string;
  workspaceId?: string;
  linkIds?: string;
  onlyPcmso?: boolean;
  includeSummary?: boolean;
};
