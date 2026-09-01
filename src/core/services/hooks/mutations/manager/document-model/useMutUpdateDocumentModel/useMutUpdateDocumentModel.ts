import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DocumentModelClassificationEnum } from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { isDocumentModelConflict } from 'components/organisms/modals/ModalEditDocumentModel/helpers/document-model-optimistic-lock';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateDocumentModel {
  id: number;
  companyId?: string;
  name?: string;
  description?: string;
  type?: DocumentTypeEnum;
  status?: StatusEnum;
  classifications?: DocumentModelClassificationEnum[];
  expectedUpdatedAt?: string;
  /** Client-only: skip success snackbar when content save will confirm the action. */
  suppressSuccessSnackbar?: boolean;
}

export async function upsertDocumentModel(
  data: IUpdateDocumentModel & { data?: unknown },
  companyId?: string,
) {
  if (!companyId) return null;
  if (data.data !== undefined && data.data !== null) {
    throw new Error(
      'Document content must be saved via PATCH /document-model/:companyId/:id/save',
    );
  }

  const { suppressSuccessSnackbar: _suppress, ...patchPayload } = data;

  const response = await api.patch<IDocumentModel>(
    ApiRoutesEnum.DOCUMENT_MODEL.replace(':companyId', companyId) +
      '/' +
      data.id,
    {
      ...patchPayload,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateDocumentModel() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateDocumentModel) =>
      upsertDocumentModel(data, getCompanyId(data)),
    {
      onSuccess: async (resp, variables) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.DOCUMENT_MODEL]);

        if (!variables.suppressSuccessSnackbar) {
          enqueueSnackbar('Modelo editado com sucesso', {
            variant: 'success',
          });
        }
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (isDocumentModelConflict(error)) return;
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
