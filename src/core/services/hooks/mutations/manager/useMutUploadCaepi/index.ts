import { useMutation, useQueryClient } from 'react-query';

import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../errors/types';

export type UploadCaepiResult = {
  success: boolean;
  totalRead: number;
  totalUnique: number;
  totalProcessed: number;
  version: number;
  updatedAt: string;
};

export async function uploadCaepiOfficialFile(
  file: File,
  companyId?: string,
): Promise<UploadCaepiResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { token } = await refreshToken();
  const path = companyId
    ? `files/checklist/epi/upload/${companyId}`
    : 'files/checklist/epi/upload';

  const response = await api.post<UploadCaepiResult>(path, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    // Bases oficiais ~120k linhas podem levar vários minutos
    timeout: 45 * 60 * 1000,
  });

  return response.data;
}

function extractErrorMessage(error: IErrorResp): string {
  const data = error?.response?.data as any;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data === 'string') return data;
  return 'Falha ao importar a base CAEPI. Verifique o arquivo e tente novamente.';
}

export function useMutUploadCaepi() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();
  const queryClient = useQueryClient();

  return useMutation(
    async (file: File) => uploadCaepiOfficialFile(file, companyId || undefined),
    {
      onSuccess: async (result) => {
        await Promise.all([
          queryClient.invalidateQueries([QueryEnum.EPIS]),
          queryClient.invalidateQueries([QueryEnum.EPIS, 'governance', companyId]),
        ]);
        enqueueSnackbar(
          `Base CAEPI importada: ${result.totalProcessed.toLocaleString('pt-BR')} CAs processados (${result.totalRead.toLocaleString('pt-BR')} linhas lidas).`,
          { variant: 'success', autoHideDuration: 8000 },
        );
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(extractErrorMessage(error), {
          variant: 'error',
          autoHideDuration: 10000,
        });
      },
    },
  );
}
