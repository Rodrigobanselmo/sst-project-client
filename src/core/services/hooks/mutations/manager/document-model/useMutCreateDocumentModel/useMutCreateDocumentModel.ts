import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateDocumentModel {
  companyId?: string;
  name: string;
  copyFromId?: number;
  description?: string;
  type: DocumentTypeEnum;
}

export async function upsertDocumentModel(
  data: ICreateDocumentModel,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IDocumentModel>(
    ApiRoutesEnum.DOCUMENT_MODEL.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateDocumentModel() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateDocumentModel) =>
      upsertDocumentModel(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.DOCUMENT_MODEL]);

        enqueueSnackbar('Modelo criado com sucesso', {
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
