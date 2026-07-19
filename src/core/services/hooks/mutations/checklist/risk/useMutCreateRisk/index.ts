import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IGenerateSourceCreate,
  IRecMedCreate,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface ICreateRisk
  extends Partial<Pick<IRiskFactors, 'name' | 'type' | 'status'>> {
  id?: '';
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

export function useMutCreateRisk(options?: {
  /** Quando true, não exibe o snackbar genérico de sucesso (fluxo customizado). */
  suppressSuccessSnackbar?: boolean;
}) {
  const { companyId, user } = useGetCompanyId(true);
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateRisk) =>
      createRisk(data, data.companyId || user?.companyId),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([QueryEnum.RISK, 'pagination']);

          const actualData = queryClient.getQueryData(
            // eslint-disable-next-line prettier/prettier
            [QueryEnum.RISK, resp.companyId],
          );
          if (actualData)
            queryClient.setQueryData(
              [QueryEnum.RISK, resp.companyId],
              (oldData: IRiskFactors[] | undefined) =>
                oldData ? [...oldData, resp] : [resp],
            );

          if (resp.companyId != companyId) {
            const actualData = queryClient.getQueryData(
              // eslint-disable-next-line prettier/prettier
              [QueryEnum.RISK, companyId],
            );
            if (actualData)
              queryClient.setQueryData(
                [QueryEnum.RISK, companyId],
                (oldData: IRiskFactors[] | undefined) =>
                  oldData ? [...oldData, resp] : [resp],
              );
          }
        }

        if (!options?.suppressSuccessSnackbar) {
          enqueueSnackbar('Fator de risco criado com sucesso', {
            variant: 'success',
          });
        }
        return resp;
      },
      onError: (error: IErrorResp) => {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.message;
        if (status === 403) {
          enqueueSnackbar(
            typeof apiMessage === 'string' && apiMessage.trim()
              ? apiMessage
              : 'Sem permissão para cadastrar fator de risco. O item da curadoria não foi alterado.',
            { variant: 'error' },
          );
          return;
        }
        enqueueSnackbar(
          typeof apiMessage === 'string' && apiMessage.trim()
            ? apiMessage
            : 'Erro ao cadastrar fator de risco',
          { variant: 'error' },
        );
      },
    },
  );
}
