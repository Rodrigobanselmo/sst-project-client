import { AbsenteeismRoutes } from '@v2/constants/routes/absenteeism.routes';
import { AbsenteeismTypeCountResultReadModel } from '@v2/models/absenteeism/models/read-absenteeism-type-count/read-absenteeism-type-count-result.model';
import {
  AbsenteeismTypeCountReadModel,
  IAbsenteeismTypeCountReadModel,
} from '@v2/models/absenteeism/models/read-absenteeism-type-count/read-absenteeism-type-count.model';

import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface BrowseAbsenteeismTypeCountParams {
  companyId: string;
  workspacesIds?: string[];
  hierarchiesIds?: string[];
  motivesIds?: number[];
  startDate?: Date;
  endDate?: Date;
}

export async function browseAbsenteeismTypeCount({
  companyId,
  ...query
}: BrowseAbsenteeismTypeCountParams) {
  const response = await api.get<IAbsenteeismTypeCountReadModel>(
    bindUrlParams({
      path: AbsenteeismRoutes.DASHBOARD.MOTIVE_COUNT,
      pathParams: { companyId },
      queryParams: { ...query },
    }),
  );

  return new AbsenteeismTypeCountReadModel(response.data);
}
