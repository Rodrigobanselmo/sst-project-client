import { useMutation } from 'react-query';
import { useSnackbar } from 'notistack';

import { v2QueryClient } from '@v2/services/query-client';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
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
          queryClient.setQueryData([
            QueryEnum.FRPS_PRIVACY,
            getCompanyId(variables.companyId),
          ], result);
          if (variables.allowPartialResults !== undefined) {
            await v2QueryClient.invalidateQueries({
              queryKey: [QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS],
            });
          }
          enqueueSnackbar('Política de privacidade psicossocial atualizada', {
            variant: 'success',
          });
        }
        return result;
      },
      onError: (error: IErrorResp) => {
        const message = error.response?.data?.message;
        enqueueSnackbar(
          (Array.isArray(message) ? message.join(' ') : message) ||
            'Não foi possível atualizar a política de privacidade',
          { variant: 'error' },
        );
      },
    },
  );
}
