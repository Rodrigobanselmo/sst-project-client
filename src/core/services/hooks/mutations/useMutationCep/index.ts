import { useMutation } from 'react-query';

import { api } from '../../../apiClient';
import { GetCEPResponse } from './types';

export async function getCep(cep: string) {
  const response = await api.get<GetCEPResponse>(
    `https://brasilapi.com.br/api/cep/v1/${cep.replace(/[ˆ\D ]/g, '')}`,
  );
  return response.data;
}

export function useMutationBrasilCep() {
  return useMutation(async (cep: string) => getCep(cep), {
    onSuccess: async (resp) => {
      console.log('resp', resp); // CEP Brasil
      return resp;
    },
    onError: (error) => {
      console.log('error ok', error); // CEP Brasil
    },
  });
}
