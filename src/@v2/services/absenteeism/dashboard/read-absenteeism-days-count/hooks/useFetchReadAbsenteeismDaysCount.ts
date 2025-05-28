import { QueryKeyAbsenteeismEnum } from '@v2/constants/enums/absenteeism-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseAbsenteeismDaysCount,
  BrowseAbsenteeismDaysCountParams,
} from '../service/read-absenteeism-days-count.service';

export const useFetchReadAbsenteeismDaysCount = (
  params: BrowseAbsenteeismDaysCountParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseAbsenteeismDaysCount(params);
    },
    queryKey: [
      QueryKeyAbsenteeismEnum.ABSENTEEISM_DAYS_COUNT,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    data: data,
  };
};
