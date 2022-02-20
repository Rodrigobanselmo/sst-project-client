import { useQuery } from 'react-query';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskFactors } from '../../../../interfaces/api/IRiskFactors';

export const queryRisk = async (): Promise<IRiskFactors[]> => {
  const response = await api.get<IRiskFactors[]>(
    `${ApiRoutesEnum.RISK_FIND_ALL}`,
  );

  return response.data;
};

export function useQueryRisk(companyId?: string): IReactQuery<IRiskFactors[]> {
  const { user } = useAuth();
  const company = companyId || user?.companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.RISK, company],
    () => queryRisk(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
