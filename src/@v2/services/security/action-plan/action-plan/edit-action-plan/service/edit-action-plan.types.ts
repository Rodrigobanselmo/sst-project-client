import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { CommentTextTypeEnum } from '@v2/models/security/enums/comment-text-type.enum';

export interface EditActionPlanParams {
  companyId: string;
  workspaceId: string;
  riskDataId: string;
  recommendationId: string;

  responsibleId?: number | null;
  validDate?: Date | null;
  status?: ActionPlanStatusEnum;
  monitoringMethod?: string | null;
  resultCriteria?: string | null;
  comment?: {
    text?: string;
    textType?: CommentTextTypeEnum;
  };
}
