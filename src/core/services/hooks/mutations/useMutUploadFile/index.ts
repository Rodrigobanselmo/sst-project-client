import { useMutation } from 'react-query';

import { parseCookies, setCookie } from 'nookies';
import { useSnackbar } from 'notistack';

import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobError } from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../errors/types';

export async function uploadFile(file: File, path: string) {
  const formData = new FormData();
  formData.append('file', file);

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

  const response = await api.post(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob',
  });

  if (response.data instanceof Blob) downloadFile(response);
}

export function useMutUploadFile() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({ file, path }: { file: File; path: string }) =>
      uploadFile(file, path),
    {
      onSuccess: async (resp) => {
        enqueueSnackbar('Arquivo enviado com sucesso', { variant: 'success' });
        return resp;
      },
      onError: (error: IErrorResp) => {
        handleBlobError(error, enqueueSnackbar);
      },
    },
  );
}
