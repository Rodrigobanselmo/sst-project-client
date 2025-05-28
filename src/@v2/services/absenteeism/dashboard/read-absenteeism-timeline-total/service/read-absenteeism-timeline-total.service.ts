import { AbsenteeismRoutes } from '@v2/constants/routes/absenteeism.routes';
import { AbsenteeismTimelineTotalResultReadModel } from '@v2/models/absenteeism/models/read-absenteeism-timeline-total/read-absenteeism-timeline-total-result.model';
import {
  AbsenteeismTimelineTotalReadModel,
  IAbsenteeismTimelineTotalReadModel,
} from '@v2/models/absenteeism/models/read-absenteeism-timeline-total/read-absenteeism-timeline-total.model';

import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface BrowseAbsenteeismTimelineTotalParams {
  companyId: string;
  workspacesIds?: string[];
  hierarchiesIds?: string[];
  motivesIds?: number[];
  startDate?: Date;
  endDate?: Date;
}

export async function browseAbsenteeismTimelineTotal({
  companyId,
  ...query
}: BrowseAbsenteeismTimelineTotalParams) {
  const response = await api.get<IAbsenteeismTimelineTotalReadModel>(
    bindUrlParams({
      path: AbsenteeismRoutes.DASHBOARD.TIMELINE_TOTAL,
      pathParams: { companyId },
      queryParams: { ...query },
    }),
  );

  return new AbsenteeismTimelineTotalReadModel(response.data);
}
