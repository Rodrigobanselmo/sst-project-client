import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEstablishmentGroup } from 'core/interfaces/api/ICompany';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

export function establishmentGroupsPath(companyId: string) {
  return ApiRoutesEnum.ESTABLISHMENT_GROUPS.replace(':companyId', companyId);
}

export async function queryEstablishmentGroups(companyId: string) {
  const response = await api.get<IEstablishmentGroup[]>(
    establishmentGroupsPath(companyId),
  );
  return response.data;
}

export function useQueryEstablishmentGroups(enabled = true) {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.ESTABLISHMENT_GROUPS, companyId],
    () =>
      companyId
        ? queryEstablishmentGroups(companyId)
        : (emptyArrayReturn() as Promise<IEstablishmentGroup[]>),
    {
      enabled: !!companyId && enabled,
      staleTime: 1000 * 60 * 5,
    },
  );

  return { ...query, data: data || [] };
}
