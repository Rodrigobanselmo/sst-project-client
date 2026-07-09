/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import { Box } from '@mui/material';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { SButton } from 'components/atoms/SButton';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { useAccess } from 'core/hooks/useAccess';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import { ModalWorkspaceStep } from './components/ModalWorkspaceStep';
import { PcmsoAttendanceServicesTable } from 'components/organisms/tables/PcmsoAttendanceServicesTable/PcmsoAttendanceServicesTable';
import { WorkspaceFirstAidSection } from './components/WorkspaceFirstAidSection/WorkspaceFirstAidSection';
import { ConvertWorkspaceToCompanyModal } from './components/ConvertWorkspaceToCompanyModal/ConvertWorkspaceToCompanyModal';
import { useEditWorkspace } from './hooks/useEditWorkspace';

export const ModalAddWorkspace = () => {
  const props = useEditWorkspace();
  const { isMaster } = useAccess();
  const { companyId } = useGetCompanyId();
  const [convertOpen, setConvertOpen] = useState(false);
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
    <>
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

        {companyData.id && (
          <>
            <WorkspaceFirstAidSection {...props} />
            <PcmsoAttendanceServicesTable workspaceId={companyData.id} companyId={companyId} />
          </>
        )}

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
          justifyContent="space-between"
        >
          <Box display="flex" gap={5}>
            {companyData.id && isMaster && (
              <SButton
                variant="outlined"
                color="warning"
                onClick={() => setConvertOpen(true)}
                style={{ minWidth: 180 }}
              >
                Converter em empresa
              </SButton>
            )}
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
      {companyData.id && (
        <ConvertWorkspaceToCompanyModal
          open={convertOpen}
          onClose={() => setConvertOpen(false)}
          onConverted={onCloseUnsaved}
          workspaceId={companyData.id}
          workspaceName={companyData.name}
        />
      )}
    </>
  );
};
