import { useQuery } from 'react-query';

import { RiskRecTypeEnum } from 'project/enum/RiskRecType.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import {
  IEsocialTable20Lograd,
  IEsocialTable24,
} from '../../../../interfaces/api/IEsocial';

export interface IQueryEsocial24Risk {
  type?: RiskRecTypeEnum;
  search?: string;
}

export const queryEsocial24Risk = async (
  { skip, take }: IPagination,
  query: IQueryEsocial24Risk,
) => {
  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<IEsocialTable24[]>>(
    `${ApiRoutesEnum.ESOCIAL24TABLES}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryEsocial24Risk(
  page = 1,
  query = {} as IQueryEsocial24Risk,
  take = 20,
) {
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.ESOCIAL_20, page, { ...pagination, ...query }],
    () => queryEsocial24Risk(pagination, { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEsocialTable24[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
