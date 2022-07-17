import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPrgDocData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertAddQueueRiskDocs {
  id?: string;
  name: string;
  riskGroupId: string;
  workspaceId: string;
  workspaceName: string;
  description?: string;
  version?: string;
  status?: StatusEnum;
  companyId?: string;
}

export async function upsertAddQueueRiskDocs(
  data: IUpsertAddQueueRiskDocs,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IPrgDocData>(
    `${ApiRoutesEnum.DOCUMENTS_PGR}/add-queue`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutAddQueueDocsPgr() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertAddQueueRiskDocs) =>
      upsertAddQueueRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp)
          queryClient.refetchQueries([
            QueryEnum.RISK_GROUP_DOCS,
            resp.companyId,
            resp.riskGroupId,
          ]);

        enqueueSnackbar('Documento enviado para processamento com sucesso', {
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
