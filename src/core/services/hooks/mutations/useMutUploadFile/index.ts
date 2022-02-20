import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import { handleBlobError } from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../errors/types';

export async function uploadFile(file: File, path: string) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });

  downloadFile(response);
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
