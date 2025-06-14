import { QueryKeyAbsenteeismEnum } from '@v2/constants/enums/absenteeism-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  readAbsenteeismHierarchyTimeCompare,
  ReadAbsenteeismHierarchyTimeCompareParams,
} from '../service/read-absenteeism-time-compare.service';

export const useFetchReadAbsenteeismHierarchyTimeCompare = (
  params: ReadAbsenteeismHierarchyTimeCompareParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readAbsenteeismHierarchyTimeCompare(params);
    },
    queryKey: [
      QueryKeyAbsenteeismEnum.ABSENTEEISM_HIERARCHY_TIME_COMPARE,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    data: data,
  };
};
