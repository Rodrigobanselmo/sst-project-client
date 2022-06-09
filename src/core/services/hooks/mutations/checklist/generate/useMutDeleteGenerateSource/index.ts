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

export async function deleteGenerateSource(id: string) {
  const response = await api.delete<IGenerateSource>(
    `${ApiRoutesEnum.GENERATE_SOURCE}/${id}`,
  );

  return response.data;
}

export function useMutDeleteGenerateSource() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (id: string) => deleteGenerateSource(id), {
    onSuccess: async (newGenerateSource) => {
      if (newGenerateSource)
        queryClient.setQueryData(
          [QueryEnum.RISK, newGenerateSource.companyId],
          (oldData: IRiskFactors[] | undefined) =>
            oldData
              ? oldData.map((risk) =>
                  risk.id === newGenerateSource.riskId
                    ? {
                        ...risk,
                        generateSource: [
                          ...risk.generateSource.filter(
                            (gs) => gs.id !== newGenerateSource.id,
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
      return newGenerateSource;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
