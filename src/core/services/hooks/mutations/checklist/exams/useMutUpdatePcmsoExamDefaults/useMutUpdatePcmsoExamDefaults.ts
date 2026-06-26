import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPcmsoExamDefaults } from 'core/interfaces/api/IPcmsoExamDefaults';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdatePcmsoExamDefaults extends IPcmsoExamDefaults {
  companyId?: string;
}

export async function updatePcmsoExamDefaults(
  data: IPcmsoExamDefaults,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.put<IPcmsoExamDefaults>(
    `${ApiRoutesEnum.COMPANIES}/${companyId}/pcmso-exam-defaults`,
    data,
  );

  return response.data;
}

export function useMutUpdatePcmsoExamDefaults() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({ companyId, ...data }: IUpdatePcmsoExamDefaults) =>
      updatePcmsoExamDefaults(data, getCompanyId(companyId)),
    {
      onSuccess: async (result, variables) => {
        if (result) {
          queryClient.invalidateQueries([
            QueryEnum.PCMSO_EXAM_DEFAULTS,
            getCompanyId(variables.companyId),
          ]);
          enqueueSnackbar('Padrões de PCMSO salvos com sucesso', {
            variant: 'success',
          });
        }
        return result;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.status == 400)
          enqueueSnackbar('Você não tem permissão para editar esses dados', {
            variant: 'error',
          });
        else
          enqueueSnackbar(error.response?.data?.message, { variant: 'error' });
      },
    },
  );
}
