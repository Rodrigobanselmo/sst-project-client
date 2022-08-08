import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskFactors } from '../../../../interfaces/api/IRiskFactors';

export const queryRisk = async (companyId: string): Promise<IRiskFactors[]> => {
  const response = await api.get<IRiskFactors[]>(
    `${ApiRoutesEnum.RISK}/${companyId}`,
  );

  return response.data;
};

export function useQueryRisk(): IReactQuery<IRiskFactors[]> {
  const { companyId } = useGetCompanyId();

  //! loads risk factors for every company every time
  const { data, ...query } = useQuery(
    [QueryEnum.RISK, companyId],
    () =>
      companyId
        ? queryRisk(companyId)
        : <Promise<IRiskFactors[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
