import { useQuery } from 'react-query';

import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { IUser } from 'core/interfaces/api/IUser';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryProfessionals {
  cpf?: string;
  name?: string;
  search?: string | null;
  companyId?: string;
  companies?: string[];
  councilUF?: string;
  email?: string;
  councilType?: string;
  councilId?: string;
  type?: ProfessionalTypeEnum[];
}

export const queryProfessionals = async (
  { skip, take }: IPagination,
  query: IQueryProfessionals,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IProfessional[]>>(
    `${ApiRoutesEnum.PROFESSIONALS}/company/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryProfessionals(
  page = 1,
  query = {} as IQueryProfessionals,
  take = 20,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.PROFESSIONALS, page, { ...pagination, ...query, companyId }],
    () => queryProfessionals(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  const response = {
    data: data?.data || ([] as IProfessional[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
