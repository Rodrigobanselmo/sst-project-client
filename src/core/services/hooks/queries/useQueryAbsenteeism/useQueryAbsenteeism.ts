import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAbsenteeism } from 'core/interfaces/api/IAbsenteeism';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryAbsenteeism {
  companyId?: string;
  id?: number;
}

export const queryAbsenteeism = async (query: IQueryAbsenteeism) => {
  const companyId = query.companyId;
  const id = query.id;
  const queries = queryString.stringify(query);

  if (!companyId) return null;

  const response = await api.get<IAbsenteeism>(
    `${ApiRoutesEnum.ABSENTEEISMS}/${id}?${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryAbsenteeism(query = {} as IQueryAbsenteeism) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);
  const { data, ...result } = useQuery(
    [QueryEnum.ABSENTEEISMS, query.id, { ...query, companyId }],
    () => queryAbsenteeism({ ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!query.id,
    },
  );

  return { ...result, data };
}
