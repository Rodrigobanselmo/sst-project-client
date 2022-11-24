import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProtocolToRisk } from 'core/interfaces/api/IProtocol';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateProtocolRisk {
  id?: number;
  protocolId?: number;
  riskId?: string;
  companyId?: string;
  minRiskDegreeQuantity?: number | null;
  minRiskDegree?: number | null;
}

export async function updateProtocol(
  data: IUpdateProtocolRisk,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IProtocolToRisk>(
    `${ApiRoutesEnum.PROTOCOL_RISK}/${data.id}/${companyId}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateProtocolRisk() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateProtocolRisk) =>
      updateProtocol(data, getCompanyId(data.companyId)),
    {
      onSuccess: async (newProtocol) => {
        if (newProtocol) {
          queryClient.invalidateQueries([QueryEnum.PROTOCOLS_RISK]);
        }

        enqueueSnackbar('Editado com sucesso', {
          variant: 'success',
        });
        return newProtocol;
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
