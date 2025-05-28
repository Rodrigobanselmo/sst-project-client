import { QueryKeyAbsenteeismEnum } from '@v2/constants/enums/absenteeism-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseAbsenteeismEmployeeTotal,
  BrowseAbsenteeismEmployeeTotalParams,
} from '../service/browse-absenteeism-employee.service';

export const useFetchBrowseAbsenteeismEmployeeTotal = (
  params: BrowseAbsenteeismEmployeeTotalParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseAbsenteeismEmployeeTotal(params);
    },
    queryKey: [
      QueryKeyAbsenteeismEnum.ABSENTEEISM_EMPLOYEE_TOTAL,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    data: data,
  };
};
