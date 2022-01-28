import React, { FC, useEffect } from 'react';

import { Global } from '@emotion/react';
import { useRouter } from 'next/router';

import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import globalStyles from '../../../core/styles/globalStyles';
import { setIsRouteLoading } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { DashboardLayout } from '../../dashboard';

const DefaultLayout: FC = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleStart = () => {
      dispatch(setIsRouteLoading(true));
    };
    const handleStop = () => {
      dispatch(setIsRouteLoading(false));
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router, dispatch]);

  return (
    <main>
      <Global styles={globalStyles} />
      <DashboardLayout>{children}</DashboardLayout>
    </main>
  );
};

export default DefaultLayout;
