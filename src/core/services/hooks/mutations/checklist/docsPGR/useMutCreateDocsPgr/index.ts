import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPrgDocData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobError } from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertRiskDocs {
  id?: string;
  name: string;
  riskGroupId: string;
  workspaceId: string;
  workspaceName: string;
  description?: string;
  version?: string;
  status?: StatusEnum;
  companyId?: string;
}

export async function upsertRiskDocs(
  data: IUpsertRiskDocs,
  companyId?: string,
) {
  if (!companyId) return null;

  const { token } = await refreshToken();

  const response = await api.post<IPrgDocData>(
    `${ApiRoutesEnum.DOCUMENTS_PGR}`,
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

export function useMutUpsertRiskDocsPgr() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskDocs) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.RISK_GROUP_DOCS]);

        enqueueSnackbar('Documento editado com sucesso', {
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
