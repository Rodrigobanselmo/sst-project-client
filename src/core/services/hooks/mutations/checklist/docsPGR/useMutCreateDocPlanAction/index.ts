import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobError } from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertRiskDocs {
  riskGroupId: string;
  companyId?: string;
  workspaceId: string;
}

export async function upsertRiskDocs(
  data: IUpsertRiskDocs,
  companyId?: string,
) {
  if (!companyId) return null;

  const { token } = await refreshToken();

  const response = await api.post(
    `${ApiRoutesEnum.DOCUMENTS_PGR_PLAN}`,
    {
      companyId,
      ...data,
    },
    {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  downloadFile(response);

  return data;
}

export function useMutCreateDocPlanAction() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskDocs) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);

        enqueueSnackbar('Documento baixado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        handleBlobError(error, enqueueSnackbar);
      },
    },
  );
}
