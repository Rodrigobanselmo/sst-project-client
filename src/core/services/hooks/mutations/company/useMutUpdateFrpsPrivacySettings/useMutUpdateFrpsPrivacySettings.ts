import { useMutation } from 'react-query';
import { useSnackbar } from 'notistack';

import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IFrpsPrivacySettings,
  IUpdateFrpsPrivacySettings,
} from 'core/interfaces/api/IFrpsPrivacySettings';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { IErrorResp } from '../../../../errors/types';

export type IMutUpdateFrpsPrivacySettings = IUpdateFrpsPrivacySettings & {
  companyId?: string;
};

export async function updateFrpsPrivacySettings(
  data: IUpdateFrpsPrivacySettings,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IFrpsPrivacySettings>(
    bindUrlParams({
      path: FormRoutes.FRPS_PRIVACY.PATH,
      pathParams: { companyId },
    }),
    data,
  );

  return response.data;
}

export function useMutUpdateFrpsPrivacySettings() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({ companyId, ...data }: IMutUpdateFrpsPrivacySettings) =>
      updateFrpsPrivacySettings(data, getCompanyId(companyId)),
    {
      onSuccess: async (result, variables) => {
        if (result) {
          queryClient.invalidateQueries([
            QueryEnum.FRPS_PRIVACY,
            getCompanyId(variables.companyId),
          ]);
          enqueueSnackbar('Política de privacidade psicossocial atualizada', {
            variant: 'success',
          });
        }
        return result;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message ||
            'Não foi possível atualizar a política de privacidade',
          { variant: 'error' },
        );
      },
    },
  );
}
