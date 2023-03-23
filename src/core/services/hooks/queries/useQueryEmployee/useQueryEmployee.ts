import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryEmployee {
  companyId?: string;
  id?: number;
  absenteeismLast60Days?: boolean;
}

export const queryEmployee = async (query: IQueryEmployee) => {
  const companyId = query.companyId;

  if (!companyId) return undefined;

  const id = query.id;
  const queries = queryString.stringify(query);
  if (!id) return undefined;

  const response = await api.get<IEmployee>(
    `${ApiRoutesEnum.EMPLOYEES}/id/${id}/${companyId}?${queries}`,
  );

  return response.data;
};

export function useQueryEmployee(
  query = {} as IQueryEmployee,
  options = {} as { enabled?: boolean },
) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);

  const { data, ...result } = useQuery(
    [QueryEnum.EMPLOYEES, query.id, { ...query, companyId }],
    () => queryEmployee({ ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!query.id && options.enabled != false,
    },
  );

  return {
    ...result,
    data,
    ...(options.enabled == false && {
      data: undefined,
    }),
  };
}
