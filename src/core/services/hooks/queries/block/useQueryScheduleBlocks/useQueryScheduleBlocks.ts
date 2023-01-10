import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IScheduleBlock } from 'core/interfaces/api/IScheduleBlock';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

export interface IQueryScheduleBlocks {
  search?: string | null;
  companyId?: string;
}

export const queryScheduleBlocks = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryScheduleBlocks,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IScheduleBlock[]>>(
    `${ApiRoutesEnum.SCHEDULE_BLOCKS}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryScheduleBlocks(
  page = 1,
  query = {} as IQueryScheduleBlocks,
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
    [QueryEnum.SCHEDULE_BLOCKS, _companyId, page, { ...query }],
    () => queryScheduleBlocks(pagination, _companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IScheduleBlock[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
