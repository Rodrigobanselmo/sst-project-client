import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalAddCouncil } from '../ModalAddCouncil';
import { ModalProfessionalStep } from './components/ModalProfessionalStep';
import { useEditProfessionals } from './hooks/useEditProfessionals';

export const ModalAddProfessional = () => {
  const props = useEditProfessionals();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    professionalData,
    loading,
  } = props;

  const buttons = [
    {},
    {
      text: professionalData.id ? 'Salvar' : 'Cadastrar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <>
      <SModal
        {...registerModal(ModalEnum.PROFESSIONALS_ADD)}
        keepMounted={false}
        onClose={onCloseUnsaved}
      >
        <SModalPaper
          p={8}
          center
          component="form"
          onSubmit={(handleSubmit as any)(onSubmit)}
        >
          <SModalHeader
            tag={professionalData.id ? 'edit' : 'add'}
            onClose={onCloseUnsaved}
            title={'Profissional'}
          />

          <ModalProfessionalStep {...props} />

          <SModalButtons
            loading={loading}
            onClose={onCloseUnsaved}
            buttons={buttons}
          />
        </SModalPaper>
      </SModal>
      <ModalAddCouncil />
    </>
  );
};
