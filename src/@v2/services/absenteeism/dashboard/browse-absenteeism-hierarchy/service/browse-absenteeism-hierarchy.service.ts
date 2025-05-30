import { AbsenteeismRoutes } from '@v2/constants/routes/absenteeism.routes';
import {
  AbsenteeismTotalHierarchyBrowseModel,
  IAbsenteeismTotalHierarchyBrowseModel,
} from '@v2/models/absenteeism/models/absenteeism-total-hierarchy/absenteeism-total-hierarchy-browse.model';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export enum AbsenteeismHierarchyTypeEnum {
  HOMOGENEOUS_GROUP = 'HOMOGENEOUS_GROUP',
  WORKSPACE = 'WORKSPACE',
  DIRECTORY = 'DIRECTORY',
  MANAGEMENT = 'MANAGEMENT',
  SECTOR = 'SECTOR',
  SUB_SECTOR = 'SUB_SECTOR',
  OFFICE = 'OFFICE',
  SUB_OFFICE = 'SUB_OFFICE',
}

export enum AbsenteeismHierarchyTotalOrderByEnum {
  TOTAL = 'TOTAL',
  TOTAL_DAYS = 'TOTAL_DAYS',
  AVERAGE_DAYS = 'AVERAGE_DAYS',
}

export interface BrowseAbsenteeismHierarchyTotalParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<AbsenteeismHierarchyTotalOrderByEnum>[];
  filters?: {
    search?: string;
    type?: AbsenteeismHierarchyTypeEnum | null;
    workspacesIds?: string[];
    hierarchiesIds?: string[];
    motivesIds?: number[];
    startDate?: Date;
    endDate?: Date;
  };
}

export async function browseAbsenteeismHierarchyTotal({
  companyId,
  ...query
}: BrowseAbsenteeismHierarchyTotalParams) {
  const response = await api.get<IAbsenteeismTotalHierarchyBrowseModel>(
    bindUrlParams({
      path: AbsenteeismRoutes.DASHBOARD.HIERARCHY_TOTAL_BROWSE,
      pathParams: { companyId },
      queryParams: {
        ...query.filters,
        ...query.pagination,
        orderBy: query.orderBy,
      },
    }),
  );

  return new AbsenteeismTotalHierarchyBrowseModel(response.data);
}
