import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { setRedirectRoute } from 'store/reducers/routeLoad/routeLoadSlice';

import { useAppDispatch } from './useAppDispatch';

export const useRedirectDetect = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (router.query.redirect) {
      dispatch(
        setRedirectRoute(
          (router.query.redirect as string)
            .replace(/\|/g, '/')
            .replace(/\$/g, '&'),
        ),
      );
      enqueueSnackbar('Você não possui autorização para acessar essa rota', {
        variant: 'warning',
      });
      delete router.query.redirect;
      router.replace(
        { pathname: router.basePath, query: router.query },
        undefined,
        { shallow: true },
      );
    }
  }, [enqueueSnackbar, router, dispatch]);
};
