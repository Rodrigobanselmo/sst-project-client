/* eslint-disable no-unused-vars */
import React, { createContext, FC, useContext } from 'react';

import { useControlModal } from '../hooks/useControlModal';

interface ModalContextData {
  getOpenModal: (name: string) => boolean;
  onOpenModal: (name: string) => void;
  onCloseModal: (name?: string | undefined) => string[] | undefined;
  onCloseAllModals: () => void;
  registerStackModal: React.MutableRefObject<string[]>;
}

const ModalContext = createContext({} as ModalContextData);

export const ModalProvider: FC = ({ children }) => {
  const {
    getOpenModal,
    onOpenModal,
    onCloseModal,
    onCloseAllModals,
    registerStackModal,
  } = useControlModal();
  return (
    <ModalContext.Provider
      value={{
        getOpenModal,
        onOpenModal,
        onCloseModal,
        onCloseAllModals,
        registerStackModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextData => useContext(ModalContext);
