import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { setRedirectRoute } from 'store/reducers/routeLoad/routeLoadSlice';

import { useAppDispatch } from './useAppDispatch';
import { RoutesEnum } from 'core/enums/routes.enums';

export const useRedirectDetect = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const redirect = router.query.redirect;
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!router.isReady || typeof redirect !== 'string') {
      handled.current = null;
      return;
    }
    const key = `${router.pathname}:${redirect}`;
    // Query cleanup is asynchronous. Process a redirect once while it is in
    // flight, so an auth render cannot start another competing navigation.
    if (handled.current === key) return;
    handled.current = key;
    dispatch(
      setRedirectRoute(redirect.replace(/\|/g, '/').replace(/\$/g, '&')),
    );
    // A normal login redirect is not a denied authenticated route.
    if (router.pathname !== RoutesEnum.LOGIN)
      enqueueSnackbar('Você não possui autorização para acessar essa rota', {
        variant: 'warning',
      });
    const { redirect: _redirect, ...query } = router.query;
    void router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  }, [enqueueSnackbar, router, redirect, dispatch]);
};
