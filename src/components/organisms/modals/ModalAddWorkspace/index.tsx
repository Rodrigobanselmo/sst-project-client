/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

import { Box } from '@mui/material';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { STabs } from 'components/molecules/STabs';
import { useAccess } from 'core/hooks/useAccess';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import { ModalWorkspaceStep } from './components/ModalWorkspaceStep';
import { PcmsoAttendanceServicesTable } from 'components/organisms/tables/PcmsoAttendanceServicesTable/PcmsoAttendanceServicesTable';
import { PcmsoExaminingPhysiciansWorkspaceTable } from 'components/organisms/tables/PcmsoExaminingPhysiciansWorkspaceTable/PcmsoExaminingPhysiciansWorkspaceTable';
import { WorkspaceFirstAidSection } from './components/WorkspaceFirstAidSection/WorkspaceFirstAidSection';
import { WorkspaceEmergencyPlanSection } from './components/WorkspaceEmergencyPlanSection/WorkspaceEmergencyPlanSection';
import { ConvertWorkspaceToCompanyModal } from './components/ConvertWorkspaceToCompanyModal/ConvertWorkspaceToCompanyModal';
import { WorkspaceModalKeepTabPanel } from './components/WorkspaceModalKeepTabPanel';
import { useEditWorkspace } from './hooks/useEditWorkspace';

const WORKSPACE_TABS = [
  { label: 'Dados', type: 'button' as const },
  { label: 'Emergência', type: 'button' as const },
  { label: 'PCMSO', type: 'button' as const },
];

export const ModalAddWorkspace = () => {
  const props = useEditWorkspace();
  const { isMaster } = useAccess();
  const { companyId } = useGetCompanyId();
  const [convertOpen, setConvertOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const {
    onSubmit,
    registerModal,
    handleSubmit,
    onCloseUnsaved,
    companyData,
    loading,
    handleDelete,
  } = props;

  const isEditing = !!companyData.id;

  useEffect(() => {
    setTab(0);
  }, [companyData.id]);

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
        sx={
          isEditing
            ? {
                minWidth: ['95%', '95%', 1080],
                maxWidth: ['95%', '95%', 1280],
              }
            : undefined
        }
      >
        <SModalHeader
          tag={companyData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Estabelecimento (área de trabalho)'}
        />

        {isEditing ? (
          <>
            <STabs
              value={tab}
              mt={2}
              mb={4}
              options={WORKSPACE_TABS}
              onChange={(_, value) => setTab(Number(value))}
            />
            <Box
              sx={{
                maxHeight: '70vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 2,
              }}
            >
              <WorkspaceModalKeepTabPanel value={tab} index={0}>
                <ModalWorkspaceStep {...props} />
              </WorkspaceModalKeepTabPanel>
              <WorkspaceModalKeepTabPanel value={tab} index={1}>
                <WorkspaceFirstAidSection {...props} />
                <Box sx={{ mt: 8 }}>
                  <SText color="text.secondary" fontSize={13} mb={-4}>
                    Clínicas, hospitais e ambulatórios de referência. São os
                    mesmos dados usados no PCMSO — não há cadastro paralelo.
                  </SText>
                  <PcmsoAttendanceServicesTable
                    workspaceId={companyData.id}
                    companyId={companyId}
                  />
                </Box>
                <WorkspaceEmergencyPlanSection
                  workspaceId={companyData.id}
                  companyId={companyId}
                />
              </WorkspaceModalKeepTabPanel>
              <WorkspaceModalKeepTabPanel value={tab} index={2}>
                <PcmsoExaminingPhysiciansWorkspaceTable
                  workspaceId={companyData.id}
                  companyId={companyId}
                />
              </WorkspaceModalKeepTabPanel>
            </Box>
          </>
        ) : (
          <ModalWorkspaceStep {...props} />
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
                type="button"
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
                type="button"
                variant="outlined"
                color="error"
                onClick={handleDelete}
                style={{ minWidth: 100 }}
              >
                Excluir
              </SButton>
            )}
            <SButton
              type="button"
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
