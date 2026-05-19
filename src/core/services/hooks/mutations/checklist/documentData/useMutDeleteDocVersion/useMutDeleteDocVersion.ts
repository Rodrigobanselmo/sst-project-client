import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { IErrorResp } from '@/@v2/types/error.type';

export interface IDeleteDocVersion {
  id: string;
  companyId?: string;
}

export async function deleteDocVersion(
  data: IDeleteDocVersion,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.delete(
    `${ApiRoutesEnum.DOC_VERSIONS}/${data.id}`.replace(':companyId', companyId),
  );

  return response.data;
}

export function useMutDeleteDocVersion() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteDocVersion) =>
      deleteDocVersion(data, getCompanyId(data)),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
        enqueueSnackbar('Documento removido da listagem', {
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
