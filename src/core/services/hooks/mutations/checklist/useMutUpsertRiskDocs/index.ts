import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPrgDocData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import { IErrorResp } from '../../../../errors/types';

export interface IUpsertRiskDocs {
  id?: string;
  name?: string;
  riskGroupId?: string;
  version?: string;
  description?: string;
  status?: StatusEnum;
  companyId?: string;
}

export async function upsertRiskDocs(
  data: IUpsertRiskDocs,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IPrgDocData>(
    `${ApiRoutesEnum.DOCUMENTS_PGR}`,
    {
      companyId,
      ...data,
    },
    {
      responseType: 'blob',
    },
  );

  downloadFile(response);

  return data;
}

export function useMutUpsertRiskDocs() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertRiskDocs) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp)
          queryClient.refetchQueries([
            QueryEnum.RISK_GROUP_DOCS,
            resp.companyId,
            resp.riskGroupId,
          ]);

        enqueueSnackbar('Documento editado com sucesso', {
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
