import { useEffect } from 'react';
import { useStore } from 'react-redux';

import { useRouter } from 'next/router';

import { useModal } from 'core/hooks/useModal';

import { useRegisterModal } from './useRegisterModal';

export const useLeavePrevent = () => {
  const router = useRouter();
  const { onCloseModal } = useModal();
  const store = useStore();
  // const {currentModal} = useRegisterModal();

  useEffect(() => {
    const handleStart = () => {
      if (store.getState().modal.currentModal.length > 0) {
        onCloseModal();
        router.events.emit('routeChangeError');
        throw 'routeChange aborted.';
      }
    };

    router.events.on('routeChangeStart', handleStart);

    return () => {
      router.events.off('routeChangeStart', handleStart);
    };
  }, [router]);
};
