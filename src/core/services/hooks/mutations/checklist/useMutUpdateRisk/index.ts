import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRecMedCreate, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

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
  const { enqueueSnackbar } = useSnackbar();
  const { companyId, user } = useGetCompanyId();

  return useMutation(
    async (data: IUpdateRisk) =>
      updateRisk(data, data.companyId || user?.companyId),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const replace = (company: string) => {
            queryClient.setQueryData(
              [QueryEnum.RISK, company],
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
          };

          const id =
            resp.companyId == user?.companyId ? companyId : resp.companyId;

          replace(resp.companyId);
          if (resp.companyId != id) replace(companyId || '');
        }

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
