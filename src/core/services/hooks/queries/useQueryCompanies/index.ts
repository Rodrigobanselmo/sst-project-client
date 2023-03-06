import { useQuery } from 'react-query';

import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import queryString from 'query-string';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationReturn } from 'core/interfaces/IPaginationResponse';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryCompanies {
  search?: string;
  companyId?: string;
  clinicExamsIds?: number[];
  clinicsCompanyId?: string;
  companyToClinicsId?: string;
  userId?: number;
  groupId?: number;
  isClinic?: boolean;
  isGroup?: boolean;
  findAll?: boolean;
  isCompany?: boolean;
  type?: CompanyTypesEnum[];
  isPeriodic?: boolean;
  selectReport?: boolean;
  isChange?: boolean;
  isAdmission?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  scheduleBlockId?: number;

  companiesIds?: string[];
  companiesGroupIds?: string[];
  cities?: string[];
  uf?: string[];
}

export type IQueryCompaniesTypes = '/by-user' | '';

export const queryCompanies = async (
  { skip, take }: IPagination,
  query: IQueryCompanies,
  type: string,
) => {
  if ('userId' in query && query.userId === 0)
    return <Promise<IPaginationReturn<ICompany>>>emptyMapReturn();
  if ('groupId' in query && query.userId === 0)
    return <Promise<IPaginationReturn<ICompany>>>emptyMapReturn();

  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationReturn<ICompany>>(
    `${ApiRoutesEnum.COMPANIES}${type}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryCompanies(
  page = 1,
  query = {} as IQueryCompanies,
  take = 8,
  type = '' as IQueryCompaniesTypes,
) {
  // const { user } = useAuth();
  const { companyId } = useGetCompanyId();

  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  // const company = user && user?.companyId;

  const { data, ...rest } = useQuery(
    [QueryEnum.COMPANIES, companyId, page, { ...pagination, ...query }, type],
    () =>
      companyId
        ? queryCompanies(pagination, { ...query, companyId }, type)
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

export function useFetchQueryCompanies() {
  const { companyId } = useGetCompanyId();

  const fetchCompanies = async (
    page = 1,
    query = {} as IQueryCompanies,
    take = 8,
    type = '' as IQueryCompaniesTypes,
  ) => {
    const pagination: IPagination = {
      skip: (page - 1) * (take || 20),
      take: take || 20,
    };

    const data = await queryClient
      .fetchQuery(
        [
          QueryEnum.COMPANIES,
          companyId,
          page,
          { ...pagination, ...query },
          type,
        ],
        () =>
          companyId
            ? queryCompanies(pagination, { ...query, companyId }, type)
            : <Promise<IPaginationReturn<ICompany>>>emptyMapReturn(),
        {
          staleTime: 1000 * 60 * 60, // 60 minute
        },
      )
      .catch((e) => console.error(e));

    return data;
  };

  return { fetchCompanies, companyId };
}
