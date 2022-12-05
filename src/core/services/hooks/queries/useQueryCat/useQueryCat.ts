import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICat } from 'core/interfaces/api/ICat';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryCat {
  companyId?: string;
  onlyCompany?: boolean;
  withReceipt?: boolean;
  id?: number;
  employeeId?: number;
}

export const queryCat = async (query: IQueryCat) => {
  const companyId = query.companyId;
  const id = query.id;
  const queries = queryString.stringify(query);

  if (!companyId) return null;

  const response = await api.get<ICat>(
    `${ApiRoutesEnum.CATS}/${id}?${queries}`.replace(':companyId', companyId),
  );

  return response.data;
};

export function useQueryCat(query = {} as IQueryCat) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);
  const { data, ...result } = useQuery(
    [QueryEnum.CATS, query.id, { ...query, companyId }],
    () => queryCat({ ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!query.id,
    },
  );

  return { ...result, data };
}
