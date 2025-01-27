import { extractApiError } from '@v2/utils/extract-api-error';
import { useSystemSnackbar } from '../useSystemSnackbar';
import { IErrorResp } from '@v2/types/error.type';

export const useApiResponseHandler = () => {
  const { showSnackBar } = useSystemSnackbar();

  const onSuccessMessage = (message: string) => {
    showSnackBar(message, {
      type: 'success',
    });
  };

  const onErrorMessage = (error: IErrorResp | string) => {
    const message = typeof error == 'string' ? error : extractApiError(error);

    showSnackBar(message, {
      type: 'error',
    });
  };

  return {
    onSuccessMessage,
    onErrorMessage,
  };
};
