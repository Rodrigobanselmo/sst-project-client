/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { QuiForm } from './components/QuiForm';
import { useModalAddQuantity } from './hooks/useModalAddQuantity';

export const ModalAddQuantity = () => {
  const props = useModalAddQuantity();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    loading,
    modalName,
  } = props;

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        p={8}
        center
        component="form"
        sx={{
          maxWidth: ['95%', '95%', 1300],
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={'add'}
          onClose={onCloseUnsaved}
          title={'Adicionar medição'}
        />

        <QuiForm {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
