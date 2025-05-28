import { QueryKeyAbsenteeismEnum } from '@v2/constants/enums/absenteeism-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseAbsenteeismHierarchyTotal,
  BrowseAbsenteeismHierarchyTotalParams,
} from '../service/browse-absenteeism-hierarchy.service';

export const useFetchBrowseAbsenteeismHierarchyTotal = (
  params: BrowseAbsenteeismHierarchyTotalParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseAbsenteeismHierarchyTotal(params);
    },
    queryKey: [
      QueryKeyAbsenteeismEnum.ABSENTEEISM_HIERARCHY_TOTAL,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    data: data,
  };
};
