import { useQuery } from 'react-query';

import queryString from 'query-string';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationReturn } from 'core/interfaces/IPaginationResponse';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryCompanies {
  search?: string;
  companyId?: string;
  userId?: number;
}

export const queryCompanies = async (
  { skip, take }: IPagination,
  query: IQueryCompanies,
) => {
  if ('userId' in query && query.userId === 0)
    return <Promise<IPaginationReturn<ICompany>>>emptyMapReturn();

  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationReturn<ICompany>>(
    `${ApiRoutesEnum.COMPANIES}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryCompanies(
  page = 1,
  query = {} as IQueryCompanies,
  take = 8,
) {
  // const { user } = useAuth();
  const { companyId } = useGetCompanyId();

  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  // const company = user && user?.companyId;

  const { data, ...rest } = useQuery(
    [QueryEnum.COMPANIES, companyId, page, query],
    () =>
      companyId
        ? queryCompanies(pagination, { ...query, companyId })
        : <Promise<IPaginationReturn<ICompany>>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  const response = {
    data: data?.data || ([] as ICompany[]),
    count: data?.count || 0,
  };

  return { ...rest, companies: response.data, count: response.count };
}
