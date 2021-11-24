/* eslint-disable no-unused-vars */
import React, { createContext, FC, useContext } from 'react';

import { useControlModal } from '../../hooks/useControlModal/useControlModal';

interface ModalContextData {
  isOpen: (name: string) => boolean;
  registerModal: (name: string) => {
    open: boolean;
    onClose: () => string[] | undefined;
  };
  openByName: (name: string) => void;
  closeByName: (name?: string | undefined) => string[] | undefined;
  onCloseAll: () => void;
}

const ModalContext = createContext({} as ModalContextData);

export const ModalProvider: FC = ({ children }) => {
  const { isOpen, registerModal, openByName, closeByName, onCloseAll } =
    useControlModal();
  return (
    <ModalContext.Provider
      value={{ isOpen, registerModal, openByName, closeByName, onCloseAll }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextData => useContext(ModalContext);
