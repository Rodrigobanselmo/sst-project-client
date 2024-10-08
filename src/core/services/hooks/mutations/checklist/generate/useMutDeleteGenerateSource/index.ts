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

export async function deleteGenerateSource(id: string) {
  const response = await api.delete<IGenerateSource>(
    `${ApiRoutesEnum.GENERATE_SOURCE}/${id}`,
  );

  return response.data;
}

export function useMutDeleteGenerateSource() {
  const { companyId } = useGetCompanyId(true);
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (id: string) => deleteGenerateSource(id), {
    onSuccess: async (newGenerateSource) => {
      queryClient.invalidateQueries([QueryEnum.GENERATE_SOURCE]);

      enqueueSnackbar('Fonte geradora deletada com sucesso', {
        variant: 'success',
      });
      return newGenerateSource;
    },
    onError: (error: IErrorResp) => {
      if (error.response.status == 400)
        enqueueSnackbar(
          'Você não tem permissão para deletar essa fonte geradora',
          { variant: 'error' },
        );
      else {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    },
  });
}
