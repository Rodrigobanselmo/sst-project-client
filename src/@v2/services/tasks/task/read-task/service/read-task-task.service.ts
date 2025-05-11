import { TaskRoutes } from '@v2/constants/routes/task.routes';
import {
  ITaskReadModel,
  TaskReadModel,
} from '@v2/models/tasks/models/task/task-read.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface ReadTaskParams {
  id: number;
  companyId: string;
}

export async function readTask({ companyId, id }: ReadTaskParams) {
  const response = await api.get<ITaskReadModel>(
    bindUrlParams({
      path: TaskRoutes.TASK.READ,
      pathParams: { companyId, id },
    }),
  );

  return new TaskReadModel(response.data);
}
