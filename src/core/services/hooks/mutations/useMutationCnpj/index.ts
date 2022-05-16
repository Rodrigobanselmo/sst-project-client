import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IErrorResp } from 'core/services/errors/types';

import { api } from '../../../apiClient';
import { GetCNPJResponse } from './types';

export async function getCnpj(cnpj: string) {
  const response = await api.get<GetCNPJResponse>(
    `${ApiRoutesEnum.CNPJ}/${cnpj.replace(/[ˆ\D ]/g, '')}`,
  );
  return response.data;
}

export function useMutationCNPJ() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(async (cep: string) => getCnpj(cep), {
    onSuccess: async (resp) => {
      return resp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
