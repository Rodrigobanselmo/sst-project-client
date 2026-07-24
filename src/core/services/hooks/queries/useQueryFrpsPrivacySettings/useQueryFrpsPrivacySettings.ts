import { useQuery } from 'react-query';

import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IFrpsPrivacySettings } from 'core/interfaces/api/IFrpsPrivacySettings';
import { api } from 'core/services/apiClient';

export async function queryFrpsPrivacySettings(companyId: string) {
  const response = await api.get<IFrpsPrivacySettings>(
    bindUrlParams({
      path: FormRoutes.FRPS_PRIVACY.PATH,
      pathParams: { companyId },
    }),
  );

  return (
    response.data ||
    ({
      indicatorsMinParticipants: 3,
      riskAnalysisAiMinParticipants: 3,
      riskAnalysisAiMinParticipantsIsDefault: true,
      canEdit: false,
    } as IFrpsPrivacySettings)
  );
}

export function useQueryFrpsPrivacySettings(
  getCompanyId?: string | null,
  enabled = true,
) {
  const { companyId } = useGetCompanyId();
  const companyID = getCompanyId || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.FRPS_PRIVACY, companyID],
    () =>
      companyID
        ? queryFrpsPrivacySettings(companyID)
        : Promise.resolve({
            indicatorsMinParticipants: 3 as const,
            riskAnalysisAiMinParticipants: 3 as const,
            riskAnalysisAiMinParticipantsIsDefault: true,
            canEdit: false,
          }),
    {
      enabled: !!companyID && enabled,
      staleTime: 1000 * 60 * 10,
    },
  );

  return {
    ...query,
    data: data || {
      indicatorsMinParticipants: 3 as const,
      riskAnalysisAiMinParticipants: 3 as const,
      riskAnalysisAiMinParticipantsIsDefault: true,
      canEdit: false,
    },
  };
}
