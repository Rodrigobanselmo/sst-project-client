import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface ICreateRecMed extends Pick<IRecMed, 'riskId'> {
  id?: number;
  status?: string;
  medName?: string;
  redName?: string;
  companyId?: string;
}

export async function createRecMed(data: ICreateRecMed, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IRecMed>(ApiRoutesEnum.REC_MED, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCreateRecMed() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateRecMed) =>
      createRecMed(data, data.companyId || user?.companyId),
    {
      onSuccess: async (newRecMed) => {
        if (newRecMed)
          queryClient.setQueryData(
            [QueryEnum.RISK, newRecMed.companyId],
            (oldData: IRiskFactors[] | undefined) =>
              oldData
                ? oldData.map((risk) =>
                    risk.id === newRecMed.riskId
                      ? {
                          ...risk,
                          recMed: [...risk.recMed, newRecMed],
                        }
                      : risk,
                  )
                : [],
          );

        enqueueSnackbar(
          'Recomendação e/ou Medida de controle criado com sucesso',
          {
            variant: 'success',
          },
        );
        return newRecMed;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
