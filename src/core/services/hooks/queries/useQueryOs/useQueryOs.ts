import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IOs } from 'core/interfaces/api/IOs';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryOS {
  companyId?: string;
}

export const queryOS = async (query: IQueryOS) => {
  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  if (!companyId) return null;

  const response = await api.get<IOs>(
    `${ApiRoutesEnum.OS}?${queries}`.replace(':companyId', companyId),
  );

  return response.data;
};

export function useQueryOs(query = {} as IQueryOS) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);

  const { data, ...result } = useQuery(
    [QueryEnum.OS, companyId, { ...query }],
    () => queryOS({ ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!companyId,
    },
  );

  return { ...result, data };
}
