import { TaskRoutes } from '@v2/constants/routes/task.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DeleteTaskParams {
  id: number;
  companyId: string;
}

export async function deleteTask({ companyId, id }: DeleteTaskParams) {
  await api.delete(
    bindUrlParams({
      path: TaskRoutes.TASK.DELETE,
      pathParams: { companyId, id },
    }),
  );
}
