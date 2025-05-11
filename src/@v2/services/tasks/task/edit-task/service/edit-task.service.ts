import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { TaskRoutes } from '@v2/constants/routes/task.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

interface ResponsiblePayload {
  userId: number;
}

interface PhotoPayload {
  fileId?: string;
  id?: number;
  delete?: boolean;
}

interface ActionPlanPayload {
  recommendationId: string;
  riskDataId: string;
  workspaceId: string;
}

export interface EditTaskParams {
  id: number;
  companyId: string;
  description?: string;
  endDate?: Date | null;
  doneDate?: Date;
  projectId?: number;
  responsible?: ResponsiblePayload[];
  photos?: PhotoPayload[];
  actionPlan?: ActionPlanPayload;
  statusId?: number | null;
  priority?: number;
}

export async function editTask({ companyId, id, ...body }: EditTaskParams) {
  await api.patch(
    bindUrlParams({
      path: TaskRoutes.TASK.EDIT,
      pathParams: { companyId, id },
    }),
    body,
  );
}
