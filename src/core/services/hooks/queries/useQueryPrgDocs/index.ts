import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult, IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortData } from 'core/utils/sorts/data.sort';

import { QueryEnum } from '../../../../enums/query.enums';
import { IPrgDocData } from '../../../../interfaces/api/IRiskData';

export interface IQueryRiPgrDoc {
  search?: string | null;
  companyId?: string;
  workspaceId?: string;
  riskGroupId: string;
}

export const queryPgrDocs = async (
  { skip, take }: IPagination,
  { riskGroupId, companyId, ...query }: IQueryRiPgrDoc,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IPrgDocData[]>>(
    ApiRoutesEnum.RISK_GROUP_DOCS.replace(':riskGroupId', riskGroupId).replace(
      ':companyId',
      companyId,
    ) + `?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryPrgDocs(
  page = 1,
  query = {} as IQueryRiPgrDoc,
  take = 20,
) {
  const { getCompanyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = getCompanyId(query.companyId);

  const { data, ...result } = useQuery(
    [QueryEnum.RISK_GROUP_DOCS, page, { ...pagination, ...query, companyId }],
    () =>
      queryPgrDocs(pagination, {
        ...query,
        companyId,
      }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IPrgDocData[]),
    count: data?.count || 0,
  };

  return { ...result, companyId, data: response.data, count: response.count };
}
