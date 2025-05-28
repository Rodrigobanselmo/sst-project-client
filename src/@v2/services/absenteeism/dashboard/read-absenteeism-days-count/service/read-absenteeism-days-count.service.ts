import { AbsenteeismRoutes } from '@v2/constants/routes/absenteeism.routes';
import { AbsenteeismDaysCountResultReadModel } from '@v2/models/absenteeism/models/read-absenteeism-days-count/read-absenteeism-days-count-result.model';
import {
  AbsenteeismDaysCountReadModel,
  IAbsenteeismDaysCountReadModel,
} from '@v2/models/absenteeism/models/read-absenteeism-days-count/read-absenteeism-days-count.model';

import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface BrowseAbsenteeismDaysCountParams {
  companyId: string;
  workspacesIds?: string[];
  hierarchiesIds?: string[];
  motivesIds?: number[];
  startDate?: Date;
  endDate?: Date;
}

export async function browseAbsenteeismDaysCount({
  companyId,
  ...query
}: BrowseAbsenteeismDaysCountParams) {
  const response = await api.get<IAbsenteeismDaysCountReadModel>(
    bindUrlParams({
      path: AbsenteeismRoutes.DASHBOARD.DAYS_COUNT,
      pathParams: { companyId },
      queryParams: { ...query },
    }),
  );

  return new AbsenteeismDaysCountReadModel(response.data);
}
