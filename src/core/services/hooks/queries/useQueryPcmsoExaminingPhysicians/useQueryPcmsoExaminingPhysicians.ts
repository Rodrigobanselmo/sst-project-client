import { useQuery } from 'react-query';

import queryString from 'query-string';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoExaminingPhysician } from 'core/interfaces/api/IPcmsoExaminingPhysician';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { getPcmsoExaminingPhysiciansPath } from 'core/services/hooks/manager/pcmsoExaminingPhysician/pcmsoExaminingPhysician.routes';

interface IQueryPcmsoExaminingPhysicians {
  search?: string | null;
}

export const queryPcmsoExaminingPhysicians = async (
  { skip, take }: IPagination,
  companyId: string,
  workspaceId: string | null | undefined,
  query: IQueryPcmsoExaminingPhysicians,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IPcmsoExaminingPhysician[]>>(
    `${getPcmsoExaminingPhysiciansPath(companyId, workspaceId || null)}?take=${take}&skip=${skip}${queries ? `&${queries}` : ''}`,
  );

  return response.data;
};

export function useQueryPcmsoExaminingPhysicians(
  page = 1,
  query: IQueryPcmsoExaminingPhysicians = {},
  rowsPerPage = 8,
  companyId?: string,
  workspaceId?: string | null,
) {
  const { companyId: routeCompanyId } = useGetCompanyId();
  const effectiveCompanyId = companyId || routeCompanyId || '';
  const isWorkspaceScope = workspaceId !== undefined && workspaceId !== null;

  const pagination: IPagination = {
    skip: (page - 1) * rowsPerPage,
    take: rowsPerPage,
  };

  const { data, isLoading, isFetching, isError, error, ...result } = useQuery(
    [
      QueryEnum.PCMSO_EXAMINING_PHYSICIANS,
      effectiveCompanyId,
      isWorkspaceScope ? workspaceId : null,
      page,
      query.search ?? '',
    ],
    () =>
      queryPcmsoExaminingPhysicians(
        pagination,
        effectiveCompanyId,
        isWorkspaceScope ? workspaceId : null,
        query,
      ),
    {
      enabled: !!effectiveCompanyId && (!isWorkspaceScope || !!workspaceId),
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
