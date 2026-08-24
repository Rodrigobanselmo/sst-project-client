import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';
import { api } from 'core/services/apiClient';

import { isDocumentModelConflict } from 'components/organisms/modals/ModalEditDocumentModel/helpers/document-model-optimistic-lock';

import { IErrorResp } from '../../../../../errors/types';

export type DocumentModelSaveSource = 'classic' | 'v2';

export interface ISaveDocumentModel {
  id: number;
  companyId?: string;
  data: IDocumentModelData;
  expectedUpdatedAt: string;
  clientHash: string;
  source?: DocumentModelSaveSource;
}

export interface ISaveDocumentModelResponse {
  id: number;
  updated_at: string;
  dataHash: string;
}

export async function saveDocumentModelContent(
  data: ISaveDocumentModel,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<ISaveDocumentModelResponse>(
    `${ApiRoutesEnum.DOCUMENT_MODEL.replace(':companyId', companyId)}/${
      data.id
    }/save`,
    {
      data: data.data,
      expectedUpdatedAt: data.expectedUpdatedAt,
      clientHash: data.clientHash,
      source: data.source,
      companyId,
    },
  );

  return response.data;
}

export function useMutSaveDocumentModel() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ISaveDocumentModel) =>
      saveDocumentModelContent(data, getCompanyId(data)),
    {
      onError: (error: IErrorResp) => {
        if (isDocumentModelConflict(error)) return;
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
