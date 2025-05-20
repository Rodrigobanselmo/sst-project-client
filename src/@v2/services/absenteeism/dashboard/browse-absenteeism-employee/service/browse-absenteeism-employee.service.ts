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
  NAME = 'DESCRIPTION',
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
    hierarchiesIds?: string[];
  };
}

export async function browseAbsenteeismEmployeeTotal({
  companyId,
  ...query
}: BrowseAbsenteeismEmployeeTotalParams) {
  return new AbsenteeismTotalEmployeeBrowseModel({
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
    },
    results: [
      {
        id: 1,
        name: 'Rodrigo Anselmo',
      },
      {
        id: 2,
        name: 'Silvana Anselmo',
      },
      {
        id: 3,
        name: 'Rodrigo Anselmo',
      },
      {
        id: 4,
        name: 'Silvana Anselmo',
      },
      {
        id: 5,
        name: 'Rodrigo Anselmo',
      },
    ],
  });

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
