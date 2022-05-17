/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

import { ModalWorkplaceStep } from './components/ModalWorkplaceStep';
import { useEditWorkspace } from './hooks/useEditWorkspace';

export const ModalAddWorkspace = () => {
  const props = useEditWorkspace();
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    companyData,
    loading,
  } = props;

  const buttons = [
    {},
    {
      text: 'Continuar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.WORKSPACE_ADD)}
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
          tag={companyData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Unidade (área de trabalho)'}
        />

        <ModalWorkplaceStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
