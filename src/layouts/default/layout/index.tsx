import React, { FC, useEffect } from 'react';
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
  const { onCloseModal } = useModal();
  const store = useStore();

  useEffect(() => {
    const handleStart = () => {
      if (store.getState().modal.currentModal.length > 0) {
        onCloseModal();
        router.events.emit('routeChangeError');
        throw 'routeChange aborted.';
      } else {
        dispatch(setIsRouteLoading(true));
      }
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
  }, [router, dispatch, store, onCloseModal]);

  return (
    <main>
      <Global styles={globalStyles} />
      <DashboardLayout>{children}</DashboardLayout>
      <DefaultModal />
    </main>
  );
};

export default DefaultLayout;
