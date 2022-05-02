import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IGho } from 'core/interfaces/api/IGho';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../../errors/types';

export async function findEpi(ca: string) {
  if (!ca) return null;

  const response = await api.get<IGho>(ApiRoutesEnum.EPI + '/' + ca);

  return response.data;
}

export function useMutFindEpi() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (ca: string) => findEpi(ca), {
    onSuccess: async (resp) => {
      return resp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
