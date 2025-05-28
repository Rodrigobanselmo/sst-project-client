import { QueryKeyAbsenteeismEnum } from '@v2/constants/enums/absenteeism-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseAbsenteeismTimelineTotal,
  BrowseAbsenteeismTimelineTotalParams,
} from '../service/read-absenteeism-timeline-total.service';

export const useFetchReadAbsenteeismTimelineTotal = (
  params: BrowseAbsenteeismTimelineTotalParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseAbsenteeismTimelineTotal(params);
    },
    queryKey: [
      QueryKeyAbsenteeismEnum.ABSENTEEISM_TIMELINE_TOTAL,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    data: data,
  };
};
