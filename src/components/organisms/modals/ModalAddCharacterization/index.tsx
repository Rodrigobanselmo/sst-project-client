/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalCharacterizationContent } from './components/ModalCharacterizationContent';
import { useEditCharacterization } from './hooks/useEditCharacterization';

export const ModalAddCharacterization = () => {
  const props = useEditCharacterization();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    characterizationData,
    loading,
    modalName,
    isEdit,
  } = props;

  const buttons = [
    {},
    {
      text: characterizationData.id ? 'Salvar' : 'Criar',
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
        sx={{ width: 1000, maxWidth: '95vw' }}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Ambiente de trabalho'}
        />

        <ModalCharacterizationContent {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
