import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IScheduleBlock } from 'core/interfaces/api/IScheduleBlock';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../../enums/query.enums';

export interface IQueryScheduleBlock {
  companyId?: string;
  id?: number;
}

export const queryScheduleBlock = async (query: IQueryScheduleBlock) => {
  const companyId = query.companyId;
  const id = query.id;
  const queries = queryString.stringify(query);

  if (!companyId) return null;

  const response = await api.get<IScheduleBlock>(
    `${ApiRoutesEnum.SCHEDULE_BLOCKS}/${id}?${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryScheduleBlock(query = {} as IQueryScheduleBlock) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);
  const { data, ...result } = useQuery(
    [QueryEnum.SCHEDULE_BLOCKS, query.id, { ...query, companyId }],
    () => queryScheduleBlock({ ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!query.id,
    },
  );

  return { ...result, data };
}
