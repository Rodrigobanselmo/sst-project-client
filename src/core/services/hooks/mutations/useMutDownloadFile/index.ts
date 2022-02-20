import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobError } from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../errors/types';

export async function downloadFileData(path: string) {
  const response = await api.get(path, {
    responseType: 'blob',
  });

  downloadFile(response);

  return response.data;
}

export function useMutDownloadFile() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (path: string) => downloadFileData(path), {
    onSuccess: async (resp) => {
      enqueueSnackbar('Arquivo baixado com sucesso', { variant: 'success' });
      return resp;
    },
    onError: (error: IErrorResp) => {
      handleBlobError(error, enqueueSnackbar);
    },
  });
}
