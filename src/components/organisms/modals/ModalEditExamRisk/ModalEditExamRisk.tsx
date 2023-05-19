import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalExamStep } from './components/ModalExamStep/ModalExamStep';
import { useEditExams } from './hooks/useEditExams';

export const ModalEditExamRisk = () => {
  const props = useEditExams();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    examData,
    loading,
    isEdit,
  } = props;

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Adicionar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.EXAM_RISK)}
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
          tag={examData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Adicionar Exame'}
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
