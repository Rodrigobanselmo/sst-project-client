/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnvironmentContent } from './components/ModalEnvironmentContent';
import { useEditEnvironment } from './hooks/useEditEnvironment';

export const ModalAddEnvironment = () => {
  const props = useEditEnvironment();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    environmentData,
    loading,
    modalName,
  } = props;

  const buttons = [
    {},
    {
      text: environmentData.id ? 'Editar' : 'Criar',
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
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={environmentData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Ambiente de trabalho'}
        />

        <ModalEnvironmentContent {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
