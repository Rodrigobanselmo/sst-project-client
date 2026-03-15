import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteDocumentModel {
  id: number;
  companyId?: string;
}

export async function deleteDocumentModel(
  data: IDeleteDocumentModel,
  companyId?: string,
) {
  const _companyId = data.companyId || companyId;
  if (!_companyId) return;

  await api.delete(
    ApiRoutesEnum.DOCUMENT_MODEL.replace(':companyId', _companyId) + '/' + data.id,
  );
}

export function useMutDeleteDocumentModel() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteDocumentModel) =>
      deleteDocumentModel(data, getCompanyId(data)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryEnum.DOCUMENT_MODEL]);
        enqueueSnackbar('Modelo excluído com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
