import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IPromoteTestToOfficialDocumentVersion {
  documentVersionId: string;
  companyId?: string;
}

export async function promoteTestToOfficialDocumentVersion(
  data: IPromoteTestToOfficialDocumentVersion,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post(
    `${ApiRoutesEnum.DOC_VERSIONS.replace(':companyId', companyId)}/${data.documentVersionId}/promote-to-official`,
  );

  return response.data;
}

export function useMutPromoteTestToOfficialDocumentVersion() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IPromoteTestToOfficialDocumentVersion) =>
      promoteTestToOfficialDocumentVersion(data, getCompanyId(data)),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);

        setTimeout(() => {
          queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
        }, 10000);

        enqueueSnackbar(
          'Versão oficial criada e enviada para processamento com sucesso',
          { variant: 'success' },
        );
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data) {
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
        }
      },
    },
  );
}
