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

export interface IGetDocumentModel {
  companyId?: string;
  type: DocumentTypeEnum;
}

export async function getDocumentModel(
  data: IGetDocumentModel,
  companyId?: string,
) {
  if (!companyId) return null;

  let docType = '';

  if (data.type == DocumentTypeEnum.PGR) docType = 'pgr';
  if (data.type == DocumentTypeEnum.PCSMO) docType = 'pcmso';

  const response = await api.post(
    `${ApiRoutesEnum.DOCUMENTS_BASE}/model/${docType}`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutGetModelDocs() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IGetDocumentModel) =>
      getDocumentModel(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.DOCUMENT_MODEL]);

        enqueueSnackbar('OK', {
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
