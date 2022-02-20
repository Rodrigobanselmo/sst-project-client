import { useCallback } from 'react';

import { selectCurrentModal } from './../../store/reducers/modal/modalSlice';
import { useAppSelector } from './useAppSelector';
import { useModal } from './useModal';

export const useRegisterModal = () => {
  const currentModal = useAppSelector(selectCurrentModal);

  const { onCloseModal } = useModal();
  const isOpen = useCallback(
    (name: string) => {
      if (currentModal.includes(name)) return true;
      return false;
    },
    [currentModal],
  );

  const registerModal = useCallback(
    (name: string, open?: boolean) => {
      return {
        open: currentModal.includes(name) || !!open,
        onClose: () => onCloseModal(name),
      };
    },
    [onCloseModal, currentModal],
  );

  return {
    isOpen,
    registerModal,
    currentModal,
  };
};
