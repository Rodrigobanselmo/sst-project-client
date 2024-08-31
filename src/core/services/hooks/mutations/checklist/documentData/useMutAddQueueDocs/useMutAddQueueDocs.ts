import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertAddDocumentQueue {
  id?: string;
  name: string;
  documentDataId: string;
  ghoIds?: string[];
  workspaceId: string;
  workspaceName: string;
  description?: string;
  version?: string;
  status?: StatusEnum;
  companyId?: string;
  type: DocumentTypeEnum;
}

export async function upsertAddDocumentQueue(
  data: IUpsertAddDocumentQueue,
  companyId?: string,
) {
  if (!companyId) return null;

  let docType = '';

  if (data.type == DocumentTypeEnum.PGR) docType = 'pgr';
  if (data.type == DocumentTypeEnum.PCSMO) docType = 'pcmso';

  const response = await api.post(
    `${ApiRoutesEnum.DOCUMENTS_BASE}/add-queue/${docType}`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutAddQueueDocs() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertAddDocumentQueue) =>
      upsertAddDocumentQueue(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);

        setTimeout(() => {
          queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
        }, 10000);

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
