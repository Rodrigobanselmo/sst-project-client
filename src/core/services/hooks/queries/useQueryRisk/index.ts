import { useQuery } from 'react-query';

import { useRouter } from 'next/router';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskFactors } from '../../../../interfaces/api/IRiskFactors';

export const queryRisk = async (): Promise<IRiskFactors[]> => {
  const response = await api.get<IRiskFactors[]>(ApiRoutesEnum.RISK);

  return response.data;
};

export function useQueryRisk(companyId?: string): IReactQuery<IRiskFactors[]> {
  const { user } = useAuth();
  const router = useRouter();

  const company =
    user &&
    (companyId || (router.query.companyId as string) || user?.companyId);

  const { data, ...query } = useQuery(
    [QueryEnum.RISK, company],
    () => (company ? queryRisk() : <Promise<IRiskFactors[]>>emptyArrayReturn()),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
