import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { QueryEnum } from 'core/enums/query.enums';
import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../contexts/AuthContext';
import { IErrorResp } from '../../../errors/types';

interface ICreateRecMed extends Pick<IRecMed, 'riskId'> {
  id: number;
  status?: string;
  companyId?: string;
}

export async function updateRecMed(data: ICreateRecMed, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<IRecMed>(`/rec-med/${data.id}`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutUpdateRecMed() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateRecMed) =>
      updateRecMed(data, data.companyId || user?.companyId),
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
                          recMed: [
                            ...risk.recMed.map((rm) =>
                              rm.id === newRecMed.id
                                ? { ...rm, ...newRecMed }
                                : rm,
                            ),
                          ],
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
