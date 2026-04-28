/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { SButton } from 'components/atoms/SButton';
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
    {
      text: companyData.id ? 'Salvar' : 'Criar',
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
          justifyContent="space-between"
        >
          <Box display="flex" gap={5}>
            {companyData.id && (
              <SButton
                variant="outlined"
                color="error"
                onClick={handleDelete}
                style={{ minWidth: 100 }}
              >
                Excluir
              </SButton>
            )}
            <SButton
              variant="outlined"
              onClick={onCloseUnsaved}
              style={{ minWidth: 100 }}
            >
              Cancelar
            </SButton>
          </Box>
        </SModalButtons>
      </SModalPaper>
    </SModal>
  );
};
