import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IDocumentModel,
  IDocumentModelData,
} from 'core/interfaces/api/IDocumentModel';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateDocumentModel {
  id: number;
  companyId?: string;
  name?: string;
  description?: string;
  type?: DocumentTypeEnum;
  status?: StatusEnum;
  data?: IDocumentModelData;
}

export async function upsertDocumentModel(
  data: IUpdateDocumentModel,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IDocumentModel>(
    ApiRoutesEnum.DOCUMENT_MODEL.replace(':companyId', companyId) +
      '/' +
      data.id,
    {
      ...data,
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
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.DOCUMENT_MODEL]);

        enqueueSnackbar('Modelo editado com sucesso', {
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
