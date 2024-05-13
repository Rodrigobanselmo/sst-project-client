import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function deleteRisk(id: string) {
  const response = await api.delete<IRiskFactors>(
    `${ApiRoutesEnum.RISK}/${id}`,
  );

  return response.data;
}

export function useMutDeleteRisk() {
  const { companyId } = useGetCompanyId(true);
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (id: string) => deleteRisk(id), {
    onSuccess: async (newRisk) => {
      queryClient.invalidateQueries([QueryEnum.RISK]);

      enqueueSnackbar('Risco deletada com sucesso', {
        variant: 'success',
      });
      return newRisk;
    },
    onError: (error: IErrorResp) => {
      if (error.response.status == 400)
        enqueueSnackbar('Você não tem permissão para deletar essa risco', {
          variant: 'error',
        });
      else {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    },
  });
}
