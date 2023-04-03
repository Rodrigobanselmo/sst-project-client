import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProtocolToRisk } from 'core/interfaces/api/IProtocol';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateProtocolRisk {
  protocolId: number;
  riskId: string;
  companyId?: string;
  minRiskDegreeQuantity?: number | null;
  minRiskDegree?: number | null;
  homoGroupsIds?: string[];
  hierarchyIds?: string[];
}

export async function createProtocol(
  data: ICreateProtocolRisk,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IProtocolToRisk>(
    `${ApiRoutesEnum.PROTOCOL_RISK}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateProtocolRisk() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: ICreateProtocolRisk) =>
      createProtocol(data, getCompanyId(data.companyId)),
    {
      onSuccess: async (newProtocol) => {
        if (newProtocol) {
          queryClient.invalidateQueries([QueryEnum.PROTOCOLS_RISK]);
        }

        enqueueSnackbar('Protocole vinculado ao risco com sucesso', {
          variant: 'success',
        });
        return newProtocol;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
