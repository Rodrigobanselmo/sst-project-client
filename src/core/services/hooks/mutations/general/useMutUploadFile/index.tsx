import { useMutation } from 'react-query';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import { parseCookies, setCookie } from 'nookies';
import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { api } from 'core/services/apiClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';
import {
  handleBlobError,
  handleBlobErrorModal,
} from 'core/utils/helpers/handleBlobError';

import { IErrorResp } from '../../../../errors/types';

export const handleError = (error: any, enqueueSnackbar: any) => {
  if (error.response?.status == 403)
    enqueueSnackbar('Sem permissões para acesso', { variant: 'error' });
  else
    enqueueSnackbar(
      'Algo aconteceu, tente novamente mais tarde ou entre em contato com o suporte',
      { variant: 'error' },
    );
};

export async function uploadFile(
  files: File | File[],
  path: string,
  payload?: any,
) {
  console.log(payload);
  const formData = new FormData();

  if (!Array.isArray(files)) formData.append('file', files);
  if (Array.isArray(files))
    files?.forEach((file) => {
      if (file) formData.append('files[]', file);
    });

  if (payload)
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        return value.forEach((item) => {
          formData.append(`${key}[]`, item);
        });
      }

      if (['string', 'number', 'boolean'].includes(typeof value))
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

  if (response.headers['content-type'] === 'application/json; charset=utf-8')
    return response.data;

  if (response.data instanceof Blob) downloadFile(response);
}

export function useMutUploadFile() {
  const { enqueueSnackbar } = useSnackbar();
  const { onStackOpenModal } = useModal();

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
        handleBlobErrorModal(error, enqueueSnackbar, onStackOpenModal);
      },
    },
  );
}
