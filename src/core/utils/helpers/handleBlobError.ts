/* eslint-disable @typescript-eslint/no-explicit-any */
import { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack';

export async function handleBlobError(
  error: any,
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined,
  ) => SnackbarKey,
) {
  try {
    const fr = new FileReader();

    fr.onload = function () {
      enqueueSnackbar(JSON.parse(this.result as string).message, {
        variant: 'error',
        autoHideDuration: 8000,
      });
    };

    fr.readAsText(error.response.data as unknown as Blob);
  } catch (e) {
    const message =
      error.response && error.response.data && error.response.data.message;

    enqueueSnackbar(message || 'Erro ao enviar arquivo', {
      variant: 'error',
    });
  }
}
