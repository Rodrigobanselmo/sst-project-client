import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoAttendanceService } from 'core/interfaces/api/IPcmsoAttendanceService';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryPcmsoAttendanceServices {
  search?: string | null;
}

export const queryPcmsoAttendanceServices = async (
  { skip, take }: IPagination,
  companyId: string,
  workspaceId: string,
  query: IQueryPcmsoAttendanceServices,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId || !workspaceId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IPcmsoAttendanceService[]>>(
    `${ApiRoutesEnum.PCMSO_ATTENDANCE_SERVICES}?take=${take}&skip=${skip}${queries ? `&${queries}` : ''}`
      .replace(':companyId', companyId)
      .replace(':workspaceId', workspaceId),
  );

  return response.data;
};

export function useQueryPcmsoAttendanceServices(
  page = 1,
  query: IQueryPcmsoAttendanceServices = {},
  rowsPerPage = 8,
  companyId?: string,
  workspaceId?: string,
) {
  const { companyId: routeCompanyId } = useGetCompanyId();
  const effectiveCompanyId = companyId || routeCompanyId || '';

  const pagination: IPagination = {
    skip: (page - 1) * rowsPerPage,
    take: rowsPerPage,
  };

  const { data, isLoading, isFetching, isError, error, ...result } = useQuery(
    [QueryEnum.PCMSO_ATTENDANCE_SERVICES, effectiveCompanyId, workspaceId, page, query.search ?? ''],
    () =>
      queryPcmsoAttendanceServices(
        pagination,
        effectiveCompanyId,
        workspaceId || '',
        query,
      ),
    {
      enabled: !!effectiveCompanyId && !!workspaceId,
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
    },
  );

  return {
    data: isError ? [] : data?.data ?? [],
    count: isError ? 0 : data?.count ?? 0,
    isError: !!isError,
    error,
    isLoading: isLoading || isFetching,
    isFetching,
    ...result,
  };
}
