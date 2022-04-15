import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import {
  IGenerateSourceCreate,
  IRecMedCreate,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface ICreateRisk
  extends Partial<Pick<IRiskFactors, 'name' | 'type' | 'status'>> {
  id?: number;
  companyId?: string;
  recMed: IRecMedCreate[];
  generateSource: IGenerateSourceCreate[];
}

export async function createRisk(data: ICreateRisk, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IRiskFactors>(ApiRoutesEnum.RISK, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCreateRisk() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateRisk) =>
      createRisk(data, data.companyId || user?.companyId),
    {
      onSuccess: async (resp) => {
        if (resp)
          queryClient.setQueryData(
            [QueryEnum.RISK, resp.companyId],
            (oldData: IRiskFactors[] | undefined) =>
              oldData ? [...oldData, resp] : [resp],
          );

        enqueueSnackbar('Fator de risco criado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}