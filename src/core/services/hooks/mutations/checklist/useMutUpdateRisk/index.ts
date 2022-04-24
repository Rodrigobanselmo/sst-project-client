import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { IRecMedCreate, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface IUpdateRisk
  extends Partial<Pick<IRiskFactors, 'name' | 'type' | 'status'>> {
  id: string;
  recMed: IRecMedCreate[];
  companyId?: string;
}

export async function updateRisk(data: IUpdateRisk, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<IRiskFactors>(
    `${ApiRoutesEnum.RISK}/${data.id}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateRisk() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateRisk) =>
      updateRisk(data, data.companyId || user?.companyId),
    {
      onSuccess: async (resp) => {
        if (resp)
          queryClient.setQueryData(
            [QueryEnum.RISK, resp.companyId],
            (oldData: IRiskFactors[] | undefined) =>
              oldData
                ? oldData.map((risk) =>
                    risk.id == resp.id
                      ? {
                          ...risk,
                          ...resp,
                          recMed: [...resp.recMed],
                          generateSource: [...resp.generateSource],
                        }
                      : risk,
                  )
                : [],
          );

        enqueueSnackbar('Fator de risco editado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
