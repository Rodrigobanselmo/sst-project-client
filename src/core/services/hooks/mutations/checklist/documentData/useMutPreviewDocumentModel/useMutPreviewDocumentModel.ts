import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';
import { IRiskDocument } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobError } from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../../../errors/types';

export interface IDownloadPreviewData {
  companyId?: string;
  type: DocumentTypeEnum;
  data: IDocumentModelData;
}

export async function previewDocumentModel(
  data: IDownloadPreviewData,
  companyId?: string,
) {
  if (!companyId) return null;

  const { token } = await refreshToken();

  const response = await api.post(
    `${ApiRoutesEnum.DOCUMENT_MODEL}/preview`.replace(':companyId', companyId),
    {
      companyId,
      ...data,
    },
    {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  downloadFile(response);

  return data;
}

export function useMutPreviewDocumentModel() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDownloadPreviewData) =>
      previewDocumentModel(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        enqueueSnackbar('Prévia baixado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        handleBlobError(error, enqueueSnackbar);
      },
    },
  );
}
