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

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface ICreateGenerateSource extends Pick<IGenerateSource, 'riskId'> {
  id?: number;
  status?: string;
  name?: string;
  recMeds?: { recName: string; medName: string; medType: string }[];
  companyId?: string;
}

export async function createGenerateSource(
  data: ICreateGenerateSource,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IGenerateSource>(
    ApiRoutesEnum.GENERATE_SOURCE,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateGenerateSource() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateGenerateSource) =>
      createGenerateSource(data, data.companyId || user?.companyId),
    {
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
                            ...risk.generateSource,
                            newGenerateSource,
                          ],
                          recMed: [
                            ...risk.recMed,
                            ...(newGenerateSource?.recMeds || []),
                          ],
                        }
                      : risk,
                  )
                : [],
          );

        enqueueSnackbar('Fonte geradora criado com sucesso', {
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
