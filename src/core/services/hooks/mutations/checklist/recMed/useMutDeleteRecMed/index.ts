import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
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

  return useMutation(async (id: string) => deleteRecMed(id), {
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
                          ...risk.recMed.filter(
                            (rec) => rec.id !== newRecMed.id,
                          ),
                        ],
                      }
                    : risk,
                )
              : [],
        );

      enqueueSnackbar('Fonte geradora deletada com sucesso', {
        variant: 'success',
      });
      return newRecMed;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
