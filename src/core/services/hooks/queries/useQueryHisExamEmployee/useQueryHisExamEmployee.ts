import { useQuery } from 'react-query';

import { StatusEnum } from 'project/enum/status.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryEmployeeHistHier {
  search?: string;
  hierarchyId?: string;
  companyId?: string;
  allCompanies?: boolean;
  employeeId?: number;
  status?: StatusEnum[];
  includeClinic?: boolean;
  orderByCreation?: boolean;
}

export const queryHisExamEmployee = async (
  { skip, take }: IPagination,
  query: IQueryEmployeeHistHier,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!query.companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IEmployeeExamsHistory[]>>(
    `${ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryHisExamEmployee(
  page = 1,
  query = {} as IQueryEmployeeHistHier,
  take = 20,
  companyID?: string,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const _companyId = companyID || companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.EMPLOYEE_HISTORY_EXAM, page, _companyId, { ...query }],
    () => queryHisExamEmployee(pagination, { ...query, companyId: _companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEmployeeExamsHistory[]),
    count: data?.count || 0,
  };

  return { ...result, _companyId, data: response.data, count: response.count };
}
