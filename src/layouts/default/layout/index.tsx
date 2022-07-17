import React, { FC, useEffect, useRef } from 'react';
import { useStore } from 'react-redux';

import { Global } from '@emotion/react';
import { useRouter } from 'next/router';

import { useModal } from 'core/hooks/useModal';
import { useRedirectDetect } from 'core/hooks/useRedirectDetect';

import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import globalStyles from '../../../core/styles/globalStyles';
import { setIsRouteLoading } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { DashboardLayout } from '../../dashboard';
import DefaultModal from '../modal';

const DefaultLayout: FC = ({ children }) => {
  useRedirectDetect();
  const router = useRouter();
  const dispatch = useAppDispatch();
  // const { onCloseModal } = useModal();
  // const store = useStore();
  // const lastPath = useRef('');
  // const currentPath = useRef('');

  useEffect(() => {
    const handleStart = (nextPath: string) => {
      // if (!lastPath.current) currentPath.current === nextPath;

      // if (store.getState().modal.currentModal.length) {
      //   onCloseModal();
      //   router.events.emit('routeChangeError');
      //   router.push({ pathname: currentPath.current }, undefined, {
      //     shallow: true,
      //   });

      //   throw 'routeChange aborted.';
      // } else {
      //   lastPath.current = currentPath.current;
      //   currentPath.current = nextPath;
      // }
      dispatch(setIsRouteLoading(true));
      // console.log('start');
    };

    const handleStop = () => {
      dispatch(setIsRouteLoading(false));
      // console.log('stop');
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
      <DefaultModal />
    </main>
  );
};

export default DefaultLayout;
