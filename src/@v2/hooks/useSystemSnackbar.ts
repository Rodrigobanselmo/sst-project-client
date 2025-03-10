import { useSnackbar as useSnackbarNoti } from 'notistack';

export const useSystemSnackbar = () => {
  const { enqueueSnackbar } = useSnackbarNoti();

  const showSnackBar = (
    message: string,
    options: { type: 'success' | 'error' },
  ) => {
    enqueueSnackbar(message, {
      variant: options.type,
      autoHideDuration: 5000,
    });
  };

  return {
    showSnackBar,
  };
};
