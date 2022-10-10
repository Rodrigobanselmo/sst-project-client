import { useMutation } from 'react-query';

import { parseCookies, setCookie } from 'nookies';
import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobError } from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../../errors/types';

export async function uploadFile(file: File, path: string, payload?: any) {
  const formData = new FormData();
  formData.append('file', file);

  if (payload)
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        return value.forEach((item) => {
          formData.append(`${key}[]`, item);
        });
      }

      if (['string', 'number'].includes(typeof value))
        formData.append(key, value as any);
    });

  const { token } = await refreshToken();

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
    async ({
      file,
      path,
      payload,
    }: {
      file: File;
      path: string;
      payload?: any;
    }) => uploadFile(file, path, payload),
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
