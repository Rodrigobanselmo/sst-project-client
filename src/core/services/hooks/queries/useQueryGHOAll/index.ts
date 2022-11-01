import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortString } from 'core/utils/sorts/string.sort';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryGHO = async (companyId: string) => {
  const response = await api.get<IGho[]>(
    ApiRoutesEnum.GHO + `/all/${companyId}`,
  );
  return response.data.sort((a, b) => sortString(a, b, 'name'));
};

export function useQueryGHOAll(companyIdProp?: string): IReactQuery<IGho[]> {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;
  // const reload = companyIdProp ? 'reload' : ''; //this reload modal to load hierarchy homogeneousGroups

  const { data, ...query } = useQuery(
    [QueryEnum.GHO, companyIdSelected],
    () =>
      companyIdSelected
        ? queryGHO(companyIdSelected)
        : <Promise<IGho[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
