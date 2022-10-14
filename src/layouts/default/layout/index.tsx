import React, { FC, useEffect } from 'react';

import { Global } from '@emotion/react';
import { ModalEditCompany } from 'components/organisms/modals/company/ModalEditCompany';
import { ModalAddContact } from 'components/organisms/modals/ModalAddContact/ModalAddContact';
import { ModalAddProfessional } from 'components/organisms/modals/ModalAddProfessional/ModalAddProfessional';
import { ModalSelectCompany } from 'components/organisms/modals/ModalSelectCompany';
import { ModalUploadNewFile } from 'components/organisms/modals/ModalUploadNewFile/ModalUploadNewFile';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { useRouter } from 'next/router';

import { useRedirectDetect } from 'core/hooks/useRedirectDetect';
import { useQueryDashboard } from 'core/services/hooks/queries/useQueryDashboard';

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
      <ModalSelectCompany />
      <ModalEditCompany />
      <ModalAddContact />
      <ModalUploadPhoto />
      <ModalUploadNewFile />
      <ModalAddProfessional />
    </main>
  );
};

export default DefaultLayout;
