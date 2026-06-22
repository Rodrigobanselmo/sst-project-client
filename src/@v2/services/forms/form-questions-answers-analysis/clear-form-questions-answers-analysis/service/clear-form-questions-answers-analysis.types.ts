export enum ClearFormAiAnalysisScopeEnum {
  APPLICATION = 'APPLICATION',
  RISK = 'RISK',
  HIERARCHY = 'HIERARCHY',
  HIERARCHY_GROUP = 'HIERARCHY_GROUP',
  HIERARCHY_GROUP_RISK = 'HIERARCHY_GROUP_RISK',
}

export interface ClearFormQuestionsAnswersAnalysisParams {
  companyId: string;
  applicationId: string;
  scope: ClearFormAiAnalysisScopeEnum;
  dryRun?: boolean;
  riskId?: string;
  hierarchyId?: string;
  hierarchyGroupId?: string;
}

export interface ClearFormQuestionsAnswersAnalysisResponse {
  deletedCount: number;
  matchedCount: number;
  dryRun: boolean;
  scope: ClearFormAiAnalysisScopeEnum;
  filters: {
    riskId?: string | null;
    hierarchyId?: string | null;
    hierarchyGroupId?: string | null;
    expandedHierarchyIds?: string[];
  };
}
