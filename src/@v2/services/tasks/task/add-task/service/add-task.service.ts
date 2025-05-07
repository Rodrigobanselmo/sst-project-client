import { TaskRoutes } from '@v2/constants/routes/task.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

interface ResponsiblePayload {
  userId: number;
}

interface PhotoPayload {
  fileId: string;
}

interface ActionPlanPayload {
  recommendationId: string;
  riskDataId: string;
  workspaceId: string;
}

export interface AddTaskParams {
  companyId: string;
  description: string;
  endDate?: Date | null;
  doneDate?: Date;
  statusId?: number | null;
  projectId?: number;
  responsible: ResponsiblePayload[];
  photos: PhotoPayload[];
  actionPlan?: ActionPlanPayload;
  priority?: number;
}

export async function addTask({ companyId, ...body }: AddTaskParams) {
  await api.post(
    bindUrlParams({
      path: TaskRoutes.TASK.ADD,
      pathParams: { companyId },
    }),
    body,
  );
}
