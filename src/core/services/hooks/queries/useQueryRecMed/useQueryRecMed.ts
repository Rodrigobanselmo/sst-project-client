import { useQuery } from 'react-query';

import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { StatusEnum } from 'project/enum/status.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskFactors, IRecMed } from 'core/interfaces/api/IRiskFactors';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { RiskEnum } from './../../../../../project/enum/risk.enums';

export interface IQueryRecMed {
  search?: string;
  companyId?: string;
  onlyRec?: boolean;
  onlyMed?: boolean;
  riskIds?: string[];
  riskType?: RiskEnum;
  medType?: MedTypeEnum[];
  recType?: RecTypeEnum[];
  status?: StatusEnum[];
}

export const queryRecMed = async (
  { skip, take }: IPagination,
  query: IQueryRecMed,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IRecMed[]>>(
    `${ApiRoutesEnum.REC_MED}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryRecMed(
  page = 1,
  query = {} as IQueryRecMed,
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
    [QueryEnum.REC_MED, page, { ...pagination, ...query, companyId }],
    () => queryRecMed(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !disabled,
    },
  );

  const response = {
    data: data?.data || ([] as IRecMed[]),
    count: data?.count || 0,
  };

  return { ...result, companyId, data: response.data, count: response.count };
}
