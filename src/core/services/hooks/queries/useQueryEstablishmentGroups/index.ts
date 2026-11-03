import { useQuery } from 'react-query';
import { canReadCompanyAuxiliaryData } from 'core/utils/company/company-auxiliary-access';

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
  const { companyId, user } = useGetCompanyId();
  const canRead = canReadCompanyAuxiliaryData(user);

  const { data, ...query } = useQuery(
    [QueryEnum.ESTABLISHMENT_GROUPS, companyId],
    () =>
      companyId
        ? queryEstablishmentGroups(companyId)
        : (emptyArrayReturn() as Promise<IEstablishmentGroup[]>),
    {
      enabled: !!companyId && enabled && canRead,
      staleTime: 1000 * 60 * 5,
    },
  );

  return { ...query, data: canRead && enabled ? data || [] : [] };
}
