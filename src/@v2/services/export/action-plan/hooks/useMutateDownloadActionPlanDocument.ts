import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { extractApiError } from '@v2/utils/extract-api-error';
import { IErrorResp } from '@v2/types/error.type';
import { downloadActionPlanDocument } from '../service/download-action-plan-document.service';

const readBlobErrorMessage = async (error: IErrorResp) => {
  const data = error?.response?.data as unknown;
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text()) as { message?: string };
      return parsed?.message || 'Erro ao exportar documento';
    } catch {
      return 'Erro ao exportar documento';
    }
  }

  return extractApiError(error) || 'Erro ao exportar documento';
};

export const useMutateDownloadActionPlanDocument = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: downloadActionPlanDocument,
    invalidateQueryKey: [],
    onSuccess: () => onSuccessMessage('Documento baixado com sucesso'),
    onError: async (error: IErrorResp) => {
      onErrorMessage(await readBlobErrorMessage(error));
    },
  });
};
