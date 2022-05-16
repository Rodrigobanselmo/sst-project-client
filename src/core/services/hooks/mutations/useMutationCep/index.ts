import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IErrorResp } from 'core/services/errors/types';

import { api } from '../../../apiClient';
import { GetCEPResponse } from './types';

export async function getCep(cnpj: string) {
  const response = await api.get<GetCEPResponse>(
    `${ApiRoutesEnum.CEP}/${cnpj.replace(/[ˆ\D ]/g, '')}`,
  );
  return response.data;
}

export function useMutationCEP() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(async (cep: string) => getCep(cep), {
    onSuccess: async (resp) => {
      return resp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
