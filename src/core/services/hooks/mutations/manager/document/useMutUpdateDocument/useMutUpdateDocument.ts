import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocument } from 'core/interfaces/api/IDocument';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateDocument {
  id?: number;
  name?: string;
  type?: DocumentTypeEnum;
  status?: StatusEnum;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  companyId?: string;
  workspaceId?: string;
  parentDocumentId?: number;
  file?: File;
}

export async function upsertRiskDocs(data: IUpdateDocument) {
  if (!data.companyId) return null;
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      return value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    }

    formData.append(key, value);
  });

  const { token } = await refreshToken();

  const path =
    ApiRoutesEnum.DOCUMENT.replace(':companyId', data.companyId) +
    '/' +
    data.id;

  const response = await api.patch(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export function useMutUpdateDocument() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateDocument) =>
      upsertRiskDocs({ ...data, companyId: getCompanyId(data) }),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.DOCUMENTS]);

        enqueueSnackbar('Contato editado com sucesso', {
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
