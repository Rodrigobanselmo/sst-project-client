import { useMutation } from 'react-query';

import api from '../../../api';
import { GetCEPResponse } from './@interfaces';

export async function getCep(cep: string) {
  const response = await api.get<GetCEPResponse>(
    `https://brasilapi.com.br/api/cep/v1/${cep.replace(/[ˆ\D ]/g, '')}`,
  );
  return response.data;
}

export function useMutationBrasilCep() {
  return useMutation(async (cep: string) => getCep(cep), {
    onSuccess: async (resp) => {
      console.log('resp', resp);
      return resp;
    },
    onError: (error) => {
      console.log('error ok', error);
    },
  });
}
