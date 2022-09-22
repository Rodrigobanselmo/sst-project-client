import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { INotification } from 'core/interfaces/api/INotification';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { useQueryCompany } from '../useQueryCompany';

export interface IQueryNotification {
  companiesIds?: string[];
  usersIds?: number[];
  isClinic?: boolean;
  isConsulting?: boolean;
  isCompany?: boolean;
  isUnread?: boolean;
}

export const queryNotification = async (
  { skip, take }: IPagination,
  query: IQueryNotification,
) => {
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<INotification[]>>(
    `${ApiRoutesEnum.NOTIFICATION}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryNotifications(
  page = 1,
  query = {} as IQueryNotification,
  take = 10,
) {
  const { companyId } = useGetCompanyId(true);
  const { data: company } = useQueryCompany();

  if (company.isClinic) query.isClinic = company.isClinic;
  if (company.isConsulting) query.isConsulting = company.isConsulting;
  if (!company.isClinic) query.isCompany = true;

  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.NOTIFICATION, page, { ...query, companyId: companyId }],
    () => queryNotification(pagination, { ...query }),
    {
      staleTime: 1000 * 60 * 10, // 10 min
    },
  );

  const response = {
    data: data?.data || ([] as INotification[]),
    count: data?.count || 0,
    countUnread: data?.countUnread || 0,
  };

  return {
    ...result,
    data: response.data,
    count: response.count,
    countUnread: response.countUnread,
  };
}
