import { useCallback } from 'react';

import { useModal } from '../contexts/ModalContext';
import { selectCurrentModal } from './../../store/reducers/modal/modalSlice';
import { useAppSelector } from './useAppSelector';

export const useRegisterModal = () => {
  const currentModal = useAppSelector(selectCurrentModal);

  const { onCloseModal } = useModal();
  const isOpen = useCallback(
    (name: string) => {
      if (currentModal === name) return true;
      return false;
    },
    [currentModal],
  );

  const registerModal = useCallback(
    (name: string) => {
      return {
        open: name === currentModal,
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
