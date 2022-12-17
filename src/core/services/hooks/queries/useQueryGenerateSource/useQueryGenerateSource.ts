import { useQuery } from 'react-query';

import { StatusEnum } from 'project/enum/status.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { RiskEnum } from '../../../../../project/enum/risk.enums';
import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryGenerateSource {
  search?: string;
  companyId?: string;
  riskIds?: string[];
  riskType?: RiskEnum;
  status?: StatusEnum[];
}

export const queryGenerateSource = async (
  { skip, take }: IPagination,
  query: IQueryGenerateSource,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IGenerateSource[]>>(
    `${ApiRoutesEnum.GENERATE_SOURCE}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryGenerateSource(
  page = 1,
  query = {} as IQueryGenerateSource,
  take = 300,
  disabled = false,
) {
  const { companyId: _companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * take,
    take: take,
  };

  const companyId = _companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.GENERATE_SOURCE, page, { ...pagination, ...query, companyId }],
    () => queryGenerateSource(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !disabled,
    },
  );

  const response = {
    data: data?.data || ([] as IGenerateSource[]),
    count: data?.count || 0,
  };

  return { ...result, companyId, data: response.data, count: response.count };
}
