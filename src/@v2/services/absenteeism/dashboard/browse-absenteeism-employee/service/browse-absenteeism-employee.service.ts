import { AbsenteeismRoutes } from '@v2/constants/routes/absenteeism.routes';
import {
  AbsenteeismTotalEmployeeBrowseModel,
  IAbsenteeismTotalEmployeeBrowseModel,
} from '@v2/models/absenteeism/models/absenteeism-total-employee/absenteeism-total-employee-browse.model';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export enum AbsenteeismEmployeeTotalOrderByEnum {
  NAME = 'NAME',
  STATUS = 'STATUS',
  TOTAL = 'TOTAL',
  TOTAL_DAYS = 'TOTAL_DAYS',
}

export interface BrowseAbsenteeismEmployeeTotalParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<AbsenteeismEmployeeTotalOrderByEnum>[];
  filters?: {
    search?: string;
    workspacesIds?: string[];
    hierarchiesIds?: string[];
    motivesIds?: number[];
    startDate?: Date;
    endDate?: Date;
  };
}

export async function browseAbsenteeismEmployeeTotal({
  companyId,
  ...query
}: BrowseAbsenteeismEmployeeTotalParams) {
  const response = await api.get<IAbsenteeismTotalEmployeeBrowseModel>(
    bindUrlParams({
      path: AbsenteeismRoutes.DASHBOARD.EMPLOYEE_TOTAL_BROWSE,
      pathParams: { companyId },
      queryParams: {
        ...query.filters,
        ...query.pagination,
        orderBy: query.orderBy,
      },
    }),
  );

  return new AbsenteeismTotalEmployeeBrowseModel(response.data);
}
