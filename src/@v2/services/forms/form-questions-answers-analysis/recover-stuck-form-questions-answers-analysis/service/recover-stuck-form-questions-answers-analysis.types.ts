import { ClearFormAiAnalysisScopeEnum } from '../../clear-form-questions-answers-analysis/service/clear-form-questions-answers-analysis.types';

export type StuckAiAnalysisRecoveryAction = 'DONE' | 'FAILED';

export interface RecoverStuckFormQuestionsAnswersAnalysisParams {
  companyId: string;
  applicationId: string;
  scope: ClearFormAiAnalysisScopeEnum;
  dryRun?: boolean;
  olderThanMinutes?: number;
  riskId?: string;
  hierarchyId?: string;
  hierarchyGroupId?: string;
}

export interface RecoverStuckFormQuestionsAnswersAnalysisItem {
  id: string;
  riskId: string;
  hierarchyId: string;
  riskName: string;
  hierarchyName: string;
  updatedAt: string;
  recoveryAction: StuckAiAnalysisRecoveryAction;
}

export interface RecoverStuckFormQuestionsAnswersAnalysisResponse {
  dryRun: boolean;
  scope: ClearFormAiAnalysisScopeEnum;
  olderThanMinutes: number;
  totalStuckCount: number;
  promoteToDoneCount: number;
  markAsFailedCount: number;
  recoveredCount: number;
  filters: {
    riskId?: string | null;
    hierarchyId?: string | null;
    hierarchyGroupId?: string | null;
    expandedHierarchyIds?: string[];
  };
  items: RecoverStuckFormQuestionsAnswersAnalysisItem[];
}
