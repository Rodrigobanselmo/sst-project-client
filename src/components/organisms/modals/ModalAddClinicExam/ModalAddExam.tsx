import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalClinicExamStep } from './components/ModalClinicExamStep';
import { useEditClinicExams } from './hooks/useEditClinicExams';

export const ModalAddClinicExam = () => {
  const props = useEditClinicExams();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    clinicExamData,
    loading,
    modalName,
  } = props;

  const buttons = [
    {},
    {
      text: clinicExamData.id ? 'Salvar' : 'Criar',
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
        sx={{ overflow: 'auto' }}
        center
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={clinicExamData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Profissional'}
        />

        <ModalClinicExamStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
