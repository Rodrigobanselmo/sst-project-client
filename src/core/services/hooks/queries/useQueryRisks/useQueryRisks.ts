import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryRisks {
  search?: string | null;
  companyId?: string;
}

export const queryRisks = async (
  { skip, take }: IPagination,
  query: IQueryRisks,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IRiskFactors[]>>(
    `${ApiRoutesEnum.RISK}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryRisks(page = 1, query = {} as IQueryRisks, take = 20) {
  const { companyId: _companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = _companyId;

  const { data, ...result } = useQuery(
    [
      QueryEnum.RISK,
      'pagination',
      page,
      { ...pagination, ...query, companyId },
    ],
    () => queryRisks(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IRiskFactors[]),
    count: data?.count || 0,
  };

  return { ...result, companyId, data: response.data, count: response.count };
}
