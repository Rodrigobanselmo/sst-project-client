import { useQuery } from 'react-query';

import queryString from 'query-string';

import { AlertsTypeEnum } from 'core/constants/maps/alert.map';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAlert } from 'core/interfaces/api/IAlert';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryAlert {
  companyId?: string;
}

export const queryAlert = async (query: IQueryAlert) => {
  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  if (!companyId) return null;

  const response = await api.get<Record<AlertsTypeEnum, IAlert>>(
    `${ApiRoutesEnum.ALERT}?${queries}`.replace(':companyId', companyId),
  );

  return response.data;
};

export function useQueryAlert(query = {} as IQueryAlert) {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(query);

  const { data, ...result } = useQuery(
    [QueryEnum.ALERT, companyId, { ...query }],
    () => queryAlert({ ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!companyId,
    },
  );

  return { ...result, data };
}
