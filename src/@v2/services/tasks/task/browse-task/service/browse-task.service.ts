import { TaskRoutes } from '@v2/constants/routes/task.routes';
import {
  ITaskBrowseModel,
  TaskBrowseModel,
} from '@v2/models/tasks/models/task/task-browse.model';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export enum TaskOrderByEnum {
  DESCRIPTION = 'DESCRIPTION',
  STATUS = 'STATUS',
  DONE_DATE = 'DONE_DATE',
  END_DATE = 'END_DATE',
  RESPONSIBLE = 'RESPONSIBLE',
  CREATOR = 'CREATOR',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  PRIORITY = 'PRIORITY',
}

export interface BrowseTaskParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<TaskOrderByEnum>[];
  filters?: {
    search?: string;
    creatorsIds?: number[];
    responsibleIds?: number[];
    projectIds?: number[];
    statusIds?: number[];
    actionPlanIds?: string[];
  };
}

export async function browseTask({ companyId, ...query }: BrowseTaskParams) {
  const response = await api.get<ITaskBrowseModel>(
    bindUrlParams({
      path: TaskRoutes.TASK.BROWSE,
      pathParams: { companyId },
      queryParams: {
        ...query.filters,
        ...query.pagination,
        orderBy: query.orderBy,
      },
    }),
  );

  return new TaskBrowseModel(response.data);
}
