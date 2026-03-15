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

import { ModalWorkspaceStep } from './components/ModalWorkspaceStep';
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
    handleDelete,
  } = props;

  const buttons = [
    {},
    {
      text: companyData.id ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
    ...(companyData.id
      ? [
          {
            text: 'Excluir',
            variant: 'outlined' as const,
            color: 'error' as const,
            onClick: handleDelete,
          },
        ]
      : []),
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
        onSubmit={(handleSubmit as any)(onSubmit)}
      >
        <SModalHeader
          tag={companyData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Estabelecimento (área de trabalho)'}
        />

        <ModalWorkspaceStep {...props} />

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
