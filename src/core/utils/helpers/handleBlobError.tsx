/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack';

import { ModalEnum } from 'core/enums/modal.enums';

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

export async function handleBlobErrorModal(
  error: any,
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined,
  ) => SnackbarKey,
  onStackOpenModal: (modal: ModalEnum, props?: any) => void,
) {
  const openModal = (errors: string[]) => {
    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      title: 'ERROS ENCONTRADOS',
      content: () => (
        <Box>
          <SText fontWeight={'bold'} fontSize={13} mt={1}>
            Total de erros: {errors.length}
          </SText>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'grey.400',
              backgroundColor: 'white',
              p: 5,
              borderRadius: 1,
              fontSize: 12,
              width: 800,
              maxHeight: 300,
              overflow: 'auto',
              mb: 10,
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {errors.map((error) => {
                return (
                  <SText
                    component="li"
                    key={error}
                    color="error.dark"
                    fontSize={13}
                    mt={1}
                  >
                    {error}
                  </SText>
                );
              })}
            </div>
          </Box>
        </Box>
      ),
    } as Partial<typeof initialBlankState>);
  };

  try {
    const fr = new FileReader();
    fr.onload = function () {
      const errors = JSON.parse(this.result as string).message as
        | string[]
        | string;
      if (typeof errors === 'string') {
        enqueueSnackbar(JSON.parse(this.result as string).message, {
          variant: 'error',
          autoHideDuration: 8000,
        });
        return;
      }
      if (Array.isArray(errors)) {
        openModal(errors);
      }
    };

    fr.readAsText(error.response.data as unknown as Blob);
  } catch (e) {
    const message =
      error.response && error.response.data && error.response.data.message;

    if (typeof message === 'string') {
      enqueueSnackbar(message || 'Erro ao enviar arquivo', {
        variant: 'error',
      });
      return;
    }
    if (Array.isArray(message)) {
      openModal(message);
    }
  }
}
