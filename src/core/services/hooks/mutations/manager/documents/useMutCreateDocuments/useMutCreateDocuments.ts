import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IContact } from 'core/interfaces/api/IContact';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateDoc {
  name?: string;
  type: DocumentTypeEnum;
  status: StatusEnum;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  companyId: string;
  workspaceId?: string;
  parentDocumentId?: number;
}

export async function createDocument(data: ICreateDoc, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IContact>(
    ApiRoutesEnum.DOCUMENT.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateDocument() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateDoc) => createDocument(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.DOCUMENTS]);

        enqueueSnackbar('Documento criado com sucesso', {
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
