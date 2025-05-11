import { TaskRoutes } from '@v2/constants/routes/task.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

interface ResponsiblePayload {
  userId: number;
}

export interface EditManyTaskParams {
  ids: number[];
  companyId: string;
  responsible?: ResponsiblePayload[];
  endDate?: Date | null;
  statusId?: number | null;
}

export async function editManyTask({ companyId, ...body }: EditManyTaskParams) {
  await api.patch(
    bindUrlParams({
      path: TaskRoutes.TASK.EDIT_MANY,
      pathParams: { companyId },
    }),
    body,
  );
}
