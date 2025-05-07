import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { TaskRoutes } from '@v2/constants/routes/task.routes';
import {
  ITaskResponsibleBrowseModel,
  TaskResponsibleBrowseModel,
} from '@v2/models/tasks/models/responsible/task-responsible-browse.model';
import { BrowseTaskResponsibleParams } from './browse-task-responsible.types';

export async function browseTaskResponsible({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseTaskResponsibleParams) {
  const response = await api.get<ITaskResponsibleBrowseModel>(
    bindUrlParams({
      path: TaskRoutes.RESPONSIBLE.BROWSE,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new TaskResponsibleBrowseModel(response.data);
}
