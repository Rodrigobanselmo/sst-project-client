import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProfessionalResponsible } from 'core/interfaces/api/IProfessionalResponsible';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryProfessionalResponsible {
  search?: string | null;
  companyId?: string;
}

export const queryProfessionalResponsible = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryProfessionalResponsible,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IProfessionalResponsible[]>>(
    `${ApiRoutesEnum.PROFESSIONAL_RESP}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryProfessionalResponsible(
  page = 1,
  query = {} as IQueryProfessionalResponsible,
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
    [QueryEnum.PROFESSIONAL_RESP, _companyId, page, { ...query }],
    () =>
      queryProfessionalResponsible(pagination, _companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IProfessionalResponsible[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
