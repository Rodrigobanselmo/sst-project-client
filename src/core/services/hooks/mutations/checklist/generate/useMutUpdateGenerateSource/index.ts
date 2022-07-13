import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IGenerateSource,
  IRecMedCreate,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

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
  const { companyId, user } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateGenerateSource) =>
      updateGenerateSource(data, user?.companyId),
    {
      onSuccess: async (newGenerateSource) => {
        if (newGenerateSource) {
          const replace = (company: string) => {
            // eslint-disable-next-line prettier/prettier
            const actualData = queryClient.getQueryData([QueryEnum.RISK, company]);
            if (actualData)
              queryClient.setQueryData(
                [QueryEnum.RISK, company],
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
          };
          replace(newGenerateSource.companyId);
          if (newGenerateSource.companyId != companyId)
            replace(companyId || '');
        }

        enqueueSnackbar('Fonte geradora editado com sucesso', {
          variant: 'success',
        });
        return newGenerateSource;
      },
      onError: (error: IErrorResp) => {
        if (error.response.status == 404)
          enqueueSnackbar(
            'Você não tem permissão para editar essa fonte geradora',
            { variant: 'error' },
          );
        else {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    },
  );
}
