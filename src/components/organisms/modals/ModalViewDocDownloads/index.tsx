/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalContentDoc } from './components/ModalContent';
import { useModalViewDocDownload } from './hooks/useModalViewDocDownload';

export const ModalViewDocDownload = () => {
  const props = useModalViewDocDownload();
  const { registerModal, onClose, modalName } = props;

  const buttons = [{}] as IModalButton[];

  return (
    <>
      <SModal
        {...registerModal(modalName)}
        keepMounted={false}
        onClose={onClose}
      >
        <SModalPaper p={8} center>
          <SModalHeader
            tag={'edit'}
            onClose={onClose}
            title={'Baixar Arquivos'}
          />

          <ModalContentDoc {...props} />

          <SModalButtons onClose={onClose} buttons={buttons} />
        </SModalPaper>
      </SModal>
    </>
  );
};
