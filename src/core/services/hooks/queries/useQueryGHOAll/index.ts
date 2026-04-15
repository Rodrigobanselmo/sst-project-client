import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortString } from 'core/utils/sorts/string.sort';

import { QueryEnum } from '../../../../enums/query.enums';

export type QueryGHOListFilters = {
  onlyWithActiveRisks?: boolean;
  riskFactorGroupDataId?: string;
};

const buildGhoAllQueryString = (filters?: QueryGHOListFilters) => {
  if (!filters?.onlyWithActiveRisks && !filters?.riskFactorGroupDataId) return '';
  const params = new URLSearchParams();
  if (filters.onlyWithActiveRisks) params.set('onlyWithActiveRisks', 'true');
  if (filters.riskFactorGroupDataId)
    params.set('riskFactorGroupDataId', filters.riskFactorGroupDataId);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const queryGHO = async (
  companyId: string,
  filters?: QueryGHOListFilters,
) => {
  const response = await api.get<IGho[]>(
    ApiRoutesEnum.GHO + `/all/${companyId}${buildGhoAllQueryString(filters)}`,
  );
  return response.data.sort((a, b) => sortString(a, b, 'name'));
};

export function useQueryGHOAll(
  companyIdProp?: string,
  filters?: QueryGHOListFilters,
): IReactQuery<IGho[]> {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;

  const { data, ...query } = useQuery(
    [
      QueryEnum.GHO,
      companyIdSelected,
      filters?.onlyWithActiveRisks,
      filters?.riskFactorGroupDataId,
    ],
    () =>
      companyIdSelected
        ? queryGHO(companyIdSelected, filters)
        : <Promise<IGho[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
