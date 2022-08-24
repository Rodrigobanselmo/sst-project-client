import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalExamStep } from './components/ModalExamStep';
import { useEditExams } from './hooks/useEditExams';

export const ModalAddExam = () => {
  const props = useEditExams();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    examData,
    loading,
    modalName,
  } = props;

  const buttons = [
    {},
    {
      text: examData.id ? 'Salvar' : 'Criar',
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
          tag={examData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Exame'}
        />

        <ModalExamStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
