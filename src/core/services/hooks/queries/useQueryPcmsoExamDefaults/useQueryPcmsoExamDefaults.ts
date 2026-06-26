import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoExamDefaults } from 'core/interfaces/api/IPcmsoExamDefaults';
import { api } from 'core/services/apiClient';

export async function queryPcmsoExamDefaults(companyId: string) {
  const response = await api.get<IPcmsoExamDefaults>(
    `${ApiRoutesEnum.COMPANIES}/${companyId}/pcmso-exam-defaults`,
  );

  return response.data || {};
}

export function useQueryPcmsoExamDefaults(
  getCompanyId?: string | null,
  enabled = true,
) {
  const { companyId } = useGetCompanyId();
  const companyID = getCompanyId || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.PCMSO_EXAM_DEFAULTS, companyID],
    () =>
      companyID
        ? queryPcmsoExamDefaults(companyID)
        : Promise.resolve({} as IPcmsoExamDefaults),
    {
      enabled: !!companyID && enabled,
      staleTime: 1000 * 60 * 10,
    },
  );

  return { ...query, data: data || ({} as IPcmsoExamDefaults) };
}
