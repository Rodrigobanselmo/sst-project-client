import { EffectivenessStatusEnum } from '@v2/models/security/enums/effectiveness-status.enum';

export interface EditActionPlanEffectivenessParams {
  companyId: string;
  workspaceId: string;
  riskDataId: string;
  recommendationId: string;
  effectivenessStatus: EffectivenessStatusEnum;
  effectivenessComment?: string | null;
}
