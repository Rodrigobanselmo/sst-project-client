import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeExamsHistory } from 'core/interfaces/api/IEmployee';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { IScheduleMedicalVisit } from 'core/interfaces/api/IScheduleMedicalVisit';
import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryScheduleMedicalVisit {
  search?: string;
  companyId?: string;
  onlyCompany?: boolean;
  companiesIds?: string[];
}

export const queryScheduleMedicalVisit = async (
  { skip, take }: IPagination,
  query: IQueryScheduleMedicalVisit,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!query.companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IScheduleMedicalVisit[]>>(
    `${ApiRoutesEnum.SCHEDULE_MEDICAL_VISIT}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      query.companyId,
    ),
  );

  return response.data;
};

export function useQueryScheduleMedicalVisit(
  page = 1,
  query = {} as IQueryScheduleMedicalVisit,
  take = 20,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const _companyId = query.companyId || companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.SCHEDULE_MEDICAL_VISIT, page, _companyId, { ...query }],
    () =>
      queryScheduleMedicalVisit(pagination, {
        ...query,
        companyId: _companyId,
      }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IScheduleMedicalVisit[]),
    count: data?.count || 0,
  };

  return { ...result, _companyId, data: response.data, count: response.count };
}
