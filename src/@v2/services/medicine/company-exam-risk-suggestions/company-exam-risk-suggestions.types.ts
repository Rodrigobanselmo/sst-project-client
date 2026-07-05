export enum ApplyExamRiskSuggestionItemStatusEnum {
  CREATED = 'CREATED',
  SKIPPED_ALREADY_LINKED = 'SKIPPED_ALREADY_LINKED',
  SKIPPED_NOT_RECOMMENDED = 'SKIPPED_NOT_RECOMMENDED',
  SKIPPED_NOT_CHARACTERIZED = 'SKIPPED_NOT_CHARACTERIZED',
  SKIPPED_NO_LIBRARY_REFERENCE = 'SKIPPED_NO_LIBRARY_REFERENCE',
  SKIPPED_NOT_SELECTED = 'SKIPPED_NOT_SELECTED',
  ERROR = 'ERROR',
}

export type IResolvedExamRiskConfig = {
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
  configSource: {
    ruleExamRowId?: string;
    usedCompanyDefaults: boolean;
    usedCreationDefaults: boolean;
  };
};

export type IApplyExamRiskSuggestionItem = {
  riskId: string;
  examId: number;
  examName: string;
  status: ApplyExamRiskSuggestionItemStatusEnum;
  linkId?: number;
  message?: string;
  proposedConfig: IResolvedExamRiskConfig;
};

export type IApplyExamRiskSuggestionsParams = {
  companyId: string;
  riskId: string;
  examIds: number[];
  workspaceId?: string;
  dryRun?: boolean;
  clientRequestId?: string;
};

export type IApplyExamRiskSuggestionsResponse = {
  companyId: string;
  riskId: string;
  dryRun: boolean;
  items: IApplyExamRiskSuggestionItem[];
  summary: {
    requested: number;
    created: number;
    skipped: number;
    errors: number;
  };
  warnings: string[];
  meta: {
    generatedAt: string;
    workspaceId: string | null;
    riskName: string;
  };
};
