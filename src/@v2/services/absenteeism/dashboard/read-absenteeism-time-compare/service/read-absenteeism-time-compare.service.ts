import { AbsenteeismRoutes } from '@v2/constants/routes/absenteeism.routes';

import {
  AbsenteeismTotalHierarchyTimeCompareModel,
  IAbsenteeismTotalHierarchyTimeCompareModel,
} from '@v2/models/absenteeism/models/absenteeism-total-hierarchy/absenteeism-total-hierarchy-time-compare.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { AbsenteeismHierarchyTypeEnum } from '../../browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';

export enum TimeCountRangeEnum {
  YEAR = 'YEAR',
  SEMESTER = 'SEMESTER',
}

export interface ReadAbsenteeismHierarchyTimeCompareParams {
  companyId: string;
  filters?: {
    items: { id: string; type: AbsenteeismHierarchyTypeEnum }[];
    range: TimeCountRangeEnum;
  };
}

export async function readAbsenteeismHierarchyTimeCompare({
  companyId,
  ...query
}: ReadAbsenteeismHierarchyTimeCompareParams) {
  if (!query.filters?.items || query.filters.items.length === 0) return null;

  const response = await api.get<
    IAbsenteeismTotalHierarchyTimeCompareModel['results']
  >(
    bindUrlParams({
      path: AbsenteeismRoutes.DASHBOARD.HIERARCHY_TIME_COMPARE,
      pathParams: { companyId },
      queryParams: {
        ...query.filters,
      },
    }),
  );

  return new AbsenteeismTotalHierarchyTimeCompareModel({
    results: response.data,
  });
}
