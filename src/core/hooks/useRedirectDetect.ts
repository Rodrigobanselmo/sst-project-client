import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

export const useRedirectDetect = () => {
  const { query } = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (query.redirect)
      enqueueSnackbar('Você não possui autorização para acessar essa rota', {
        variant: 'warning',
      });
  }, [enqueueSnackbar, query]);
};
