import { useMutation } from 'react-query';

import { parseCookies, setCookie } from 'nookies';
import { useSnackbar } from 'notistack';

import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobError } from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../../errors/types';

export async function downloadFileData(path: string) {
  const { 'nextauth.refreshToken': refresh_token } = parseCookies();

  const refresh = await api.post('/refresh', { refresh_token });

  const { token } = refresh.data;

  setCookie(null, 'nextauth.token', token, {
    maxAge: 60 * 60 * 25 * 30, // 30 days
    path: '/',
  });

  setCookie(null, 'nextauth.refreshToken', refresh.data.refresh_token, {
    maxAge: 60 * 60 * 25 * 30, // 30 days
    path: '/',
  });

  const response = await api.get(path, {
    responseType: 'blob',
    headers: { Authorization: `Bearer ${token}` },
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
