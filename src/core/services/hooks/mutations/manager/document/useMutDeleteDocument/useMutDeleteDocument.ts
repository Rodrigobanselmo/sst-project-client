import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocument } from 'core/interfaces/api/IDocument';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteDocument {
  id?: number;
  companyId?: string;
}

export async function upsertRiskDocs(
  data: IDeleteDocument,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.delete<IDocument>(
    ApiRoutesEnum.DOCUMENT.replace(':companyId', companyId) + '/' + data.id,
  );

  return response.data;
}

export function useMutDeleteDocument() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteDocument) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.DOCUMENTS]);

        enqueueSnackbar('Documento deletado com sucesso', {
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
