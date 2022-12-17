import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IGenerateSource,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function deleteRecMed(id: string) {
  const response = await api.delete<IGenerateSource>(
    `${ApiRoutesEnum.REC_MED}/${id}`,
  );

  return response.data;
}

export function useMutDeleteRecMed() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId(true);

  return useMutation(async (id: string) => deleteRecMed(id), {
    onSuccess: async (newRecMed) => {
      queryClient.invalidateQueries([QueryEnum.REC_MED]);

      enqueueSnackbar('Fonte geradora deletada com sucesso', {
        variant: 'success',
      });
      return newRecMed;
    },
    onError: (error: IErrorResp) => {
      if (error.response.status == 400)
        enqueueSnackbar('Você não tem permissão para deletar esse dado', {
          variant: 'error',
        });
      else {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    },
  });
}
