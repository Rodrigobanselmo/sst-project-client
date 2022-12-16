import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryRisk {
  companyId: string;
  id: string;
}

export const queryRisk = async ({ companyId, id, ...query }: IQueryRisk) => {
  const queries = queryString.stringify(query);

  if (!companyId) return null;
  if (!id) return null;

  const response = await api.get<IRiskFactors>(
    `${ApiRoutesEnum.RISK}/${companyId}/${id}?${queries}`,
  );

  return response.data;
};

export function useQueryRisk(query = {} as IQueryRisk) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);

  const { data, ...result } = useQuery(
    [QueryEnum.RISK, companyId, { ...query }],
    () => queryRisk({ ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!companyId,
    },
  );

  return { ...result, data };
}
