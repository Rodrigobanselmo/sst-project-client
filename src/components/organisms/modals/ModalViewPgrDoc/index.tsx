/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import { ModalContentDoc } from './components/ModalContent';
import { useModalViewPgrDoc } from './hooks/useModalViewPgrDoc';

export const ModalViewPgrDoc = () => {
  const props = useModalViewPgrDoc();
  const { companyId } = useGetCompanyId();
  const { registerModal, onClose, uploadMutation, modalName } = props;

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
