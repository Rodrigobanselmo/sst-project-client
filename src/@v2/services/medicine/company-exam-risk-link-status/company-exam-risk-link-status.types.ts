export enum PcmsoLinkStatusEnum {
  OK = 'OK',
  ADJUSTMENT_RECOMMENDED = 'ADJUSTMENT_RECOMMENDED',
  RISK_NOT_CHARACTERIZED = 'RISK_NOT_CHARACTERIZED',
  NO_LIBRARY_REFERENCE = 'NO_LIBRARY_REFERENCE',
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

export type IExamRiskLinkStatusResponse = {
  items: IExamRiskLinkStatusItem[];
  summary: IExamRiskLinkStatusSummary;
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
