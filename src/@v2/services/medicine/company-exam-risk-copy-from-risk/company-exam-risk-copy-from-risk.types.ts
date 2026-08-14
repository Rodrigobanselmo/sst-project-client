export enum ExamRiskCopyFromRiskSourceEnum {
  LIBRARY = 'LIBRARY',
  LOCAL = 'LOCAL',
}

export enum ExamRiskCopyFromRiskAvailabilityEnum {
  AVAILABLE = 'AVAILABLE',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
}

export enum ExamRiskCopyFromRiskItemStatusEnum {
  CREATED = 'CREATED',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  SKIPPED_NOT_ELIGIBLE = 'SKIPPED_NOT_ELIGIBLE',
  ERROR = 'ERROR',
}

export type IExamRiskCopyFromRiskConfig = {
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

export type IExamRiskCopyFromRiskSelectedItem = {
  examId: number;
  source: ExamRiskCopyFromRiskSourceEnum;
  sourceLinkId?: number;
};

export type IExamRiskCopyFromRiskCandidate = {
  key: string;
  source: ExamRiskCopyFromRiskSourceEnum;
  examId: number;
  examName: string;
  proposedConfig: IExamRiskCopyFromRiskConfig;
  availability: ExamRiskCopyFromRiskAvailabilityEnum;
  selectable: boolean;
  existingLinkId?: number;
  driftFields: string[];
  blockReason?: string;
  sourceRuleId?: string;
  sourceRuleExamId?: string;
  sourceLinkId?: number;
};

export type IExamRiskCopyFromRiskSystemRule = {
  action: 'created' | 'alreadyExists' | 'skipped';
  ruleId?: string;
  reason?: string;
};

export type IExamRiskCopyFromRiskItemResult = IExamRiskCopyFromRiskCandidate & {
  status: ExamRiskCopyFromRiskItemStatusEnum;
  linkId?: number;
  message?: string;
  systemRule?: IExamRiskCopyFromRiskSystemRule;
};

export type IExamRiskCopyFromRiskParams = {
  companyId: string;
  sourceRiskId: string;
  targetRiskId: string;
  items?: IExamRiskCopyFromRiskSelectedItem[];
  publishAsSystemRule?: boolean;
  dryRun?: boolean;
  clientRequestId?: string;
};

export type IExamRiskCopyFromRiskResponse = {
  companyId: string;
  sourceRiskId: string;
  targetRiskId: string;
  dryRun: boolean;
  publishAsSystemRule: boolean;
  items: IExamRiskCopyFromRiskCandidate[];
  results: IExamRiskCopyFromRiskItemResult[];
  summary: {
    libraryCount: number;
    localCount: number;
    available: number;
    alreadyExists: number;
    conflict: number;
    requested: number;
    created: number;
    skipped: number;
    errors: number;
  };
  warnings: string[];
  meta: {
    generatedAt: string;
    sourceRiskName: string;
    targetRiskName: string;
    clientRequestId: string | null;
  };
};
