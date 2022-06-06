import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import {
  IGenerateSource,
  IRecMedCreate,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface ICreateGenerateSource extends Pick<IGenerateSource, 'riskId'> {
  id: string;
  status?: string;
  name?: string;
  companyId?: string;
  recMeds?: (IRecMedCreate & { id?: string })[];
}

export async function updateGenerateSource(
  data: ICreateGenerateSource,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IGenerateSource>(
    `${ApiRoutesEnum.GENERATE_SOURCE}/${data.id}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateGenerateSource() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateGenerateSource) =>
      updateGenerateSource(data, data.companyId || user?.companyId),
    {
      onSuccess: async (newGenerateSource) => {
        if (newGenerateSource)
          queryClient.setQueryData(
            [QueryEnum.RISK, user?.companyId],
            (oldData: IRiskFactors[] | undefined) =>
              oldData
                ? oldData.map((risk) =>
                    risk.id === newGenerateSource.riskId
                      ? {
                          ...risk,
                          generateSource: [
                            ...risk.generateSource.map((gs) =>
                              gs.id === newGenerateSource.id
                                ? { ...gs, ...newGenerateSource }
                                : gs,
                            ),
                          ],
                        }
                      : risk,
                  )
                : [],
          );

        enqueueSnackbar('Fonte geradora editado com sucesso', {
          variant: 'success',
        });
        return newGenerateSource;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
