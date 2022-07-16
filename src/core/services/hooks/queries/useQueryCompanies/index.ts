import { useQuery } from 'react-query';

import { useRouter } from 'next/router';
import queryString from 'query-string';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationReturn } from 'core/interfaces/IPaginationResponse';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn, emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryCompanies {
  search: string;
}

export const queryCompanies = async (
  { skip, take }: IPagination,
  query: IQueryCompanies,
) => {
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
  const { user } = useAuth();
  const router = useRouter();

  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const company =
    user && ((router.query.companyId as string) || user?.companyId);

  const { data, ...rest } = useQuery(
    [QueryEnum.COMPANIES, company, page, query],
    () =>
      company
        ? queryCompanies(pagination, query)
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
