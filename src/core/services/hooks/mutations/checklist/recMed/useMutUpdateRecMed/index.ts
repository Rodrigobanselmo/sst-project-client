import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { RecTypeEnum } from 'project/enum/recType.enum';

interface IUpdateRecMed extends Pick<IRecMed, 'riskId'> {
  id: string;
  status?: string;
  companyId?: string;
  recType?: RecTypeEnum | string;
  recName?: string;
  medName?: string;
  medType?: string;
}

export async function updateRecMed(data: IUpdateRecMed, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<IRecMed>(
    `${ApiRoutesEnum.REC_MED}/${data.id}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateRecMed() {
  const { companyId, user } = useGetCompanyId(true);
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateRecMed) =>
      updateRecMed(data, data.companyId || user?.companyId),
    {
      onSuccess: async (newRecMed) => {
        queryClient.invalidateQueries([QueryEnum.REC_MED]);
        // Atualiza `recs.recType` no RiskTool após classificar a recomendação.
        queryClient.invalidateQueries([QueryEnum.RISK_DATA]);

        enqueueSnackbar(
          'Recomendação e/ou Medida de controle criado com sucesso',
          {
            variant: 'success',
          },
        );
        return newRecMed;
      },
      onError: (error: IErrorResp) => {
        if (error.response.status == 400)
          enqueueSnackbar('Você não tem permissão para editar esse dado', {
            variant: 'error',
          });
        else {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    },
  );
}
