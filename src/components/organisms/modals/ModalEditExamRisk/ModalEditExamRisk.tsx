import React, { useState } from 'react';

import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';
import { getSaveActionColor } from 'core/utils/save-action-color';
import { QueryEnum } from 'core/enums/query.enums';
import { queryClient } from 'core/services/queryClient';
import { useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { refetchExamRiskLinkStatusQueries } from '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status';
import { companyExamRiskCoverageQueryKeys } from '@v2/services/medicine/company-exam-risk-coverage/hooks/company-exam-risk-coverage.query-keys';

import { CopyExamRiskFromRiskDialog } from './components/CopyExamRiskFromRiskDialog';
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
    onRemove,
    companyId,
    isMasterAdmin,
    onClose,
    isDirty,
    setSaveIntent,
  } = props;
  const [copyFromRiskOpen, setCopyFromRiskOpen] = useState(false);
  const tanstackQueryClient = useTanstackQueryClient();
  const saveActionColor = getSaveActionColor(isDirty);

  const buttons = (
    isEdit
      ? [
          {},
          {
            text: 'Salvar',
            variant: 'outlined',
            type: 'submit',
            color: saveActionColor,
            disabled: loading,
            onClick: () => setSaveIntent('stay'),
          },
          {
            text: 'Salvar e sair',
            variant: 'contained',
            type: 'submit',
            color: saveActionColor,
            disabled: loading,
            onClick: () => setSaveIntent('exit'),
          },
        ]
      : [
          {},
          {
            text: 'Salvar',
            variant: 'contained',
            type: 'submit',
            disabled: loading,
            onClick: () => setSaveIntent('exit'),
          },
        ]
  ) as IModalButton[];

  const onCopySuccess = () => {
    void queryClient.refetchQueries([QueryEnum.EXAMS_RISK]);
    void refetchExamRiskLinkStatusQueries();
    void tanstackQueryClient.invalidateQueries({
      queryKey: companyExamRiskCoverageQueryKeys.all(),
    });
  };

  return (
    <>
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
            onDelete={onRemove}
          />

          <ModalExamStep
            {...props}
            onCopyFromRisk={() => setCopyFromRiskOpen(true)}
          />

          <SModalButtons
            loading={loading}
            onClose={onCloseUnsaved}
            buttons={buttons}
          />
        </SModalPaper>
      </SModal>
      {companyId && examData.riskId && (
        <CopyExamRiskFromRiskDialog
          open={copyFromRiskOpen}
          companyId={companyId}
          targetRiskId={examData.riskId}
          targetRiskName={examData.risk?.name}
          targetRisk={examData.risk}
          isMasterAdmin={isMasterAdmin}
          onClose={() => setCopyFromRiskOpen(false)}
          onSuccess={onCopySuccess}
          onCloseParentAfterSuccess={onClose}
        />
      )}
    </>
  );
};
