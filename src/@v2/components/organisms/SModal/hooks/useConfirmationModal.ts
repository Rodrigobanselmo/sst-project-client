import React from 'react';
import { useModal } from '../../../../hooks/useModal';
import { ModalKeyEnum } from '../../../../hooks/useModal';
import { ConfirmationModal } from '../implementations/ConfirmationModal/ConfirmationModal';

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const useConfirmationModal = () => {
  const { openModal } = useModal();

  const showConfirmation = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        resolve(true);
      };

      const handleCancel = () => {
        resolve(false);
      };

      openModal(
        ModalKeyEnum.CONFIRMATION_MODAL,
        React.createElement(ConfirmationModal, {
          ...options,
          onConfirm: handleConfirm,
          onCancel: handleCancel,
        }),
      );
    });
  };

  return { showConfirmation };
};
