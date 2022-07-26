import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalEmployeeStep } from './components/ModalEmployeeStep';
import { useEditEmployees } from './hooks/useEditEmployees';

export const ModalAddEmployee = () => {
  const props = useEditEmployees();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    employeeData,
    loading,
  } = props;

  const buttons = [
    {},
    {
      text: employeeData.id ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.EMPLOYEES_ADD)}
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
          tag={employeeData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Empregado'}
        />

        <ModalEmployeeStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
