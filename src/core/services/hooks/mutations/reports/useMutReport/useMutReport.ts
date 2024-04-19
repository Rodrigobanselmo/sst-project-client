import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobErrorModal } from 'core/utils/helpers/handleBlobError';

import { useModal } from 'core/hooks/useModal';
import { IErrorResp } from '../../../../errors/types';
import { IReportBase, reportTypeMap } from './types';

export async function mutReport(
  { type, ...data }: IReportBase,
  companyId: string,
) {
  const { token } = await refreshToken();
  const apiRoute = reportTypeMap[type].route;

  const response = await api.post(
    `${apiRoute}`.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
    {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.headers['content-type'] === 'application/json; charset=utf-8')
    return response.data;

  downloadFile(response);

  return data;
}

export function useMutReport() {
  const { enqueueSnackbar } = useSnackbar();
  const { onStackOpenModal } = useModal();
  const { getCompanyId } = useGetCompanyId(true);

  return useMutation(
    async (data: IReportBase) => mutReport(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp.isXml)
          enqueueSnackbar('Documento baixado com sucesso', {
            variant: 'success',
          });

        return resp;
      },
      onError: (error: IErrorResp) => {
        handleBlobErrorModal(error, enqueueSnackbar, onStackOpenModal);
      },
    },
  );
}
