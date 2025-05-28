import { QueryKeyAbsenteeismEnum } from '@v2/constants/enums/absenteeism-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseAbsenteeismTypeCount,
  BrowseAbsenteeismTypeCountParams,
} from '../service/read-absenteeism-type-count.service';

export const useFetchReadAbsenteeismTypeCount = (
  params: BrowseAbsenteeismTypeCountParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseAbsenteeismTypeCount(params);
    },
    queryKey: [
      QueryKeyAbsenteeismEnum.ABSENTEEISM_TYPE_COUNT,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    data: data,
  };
};
