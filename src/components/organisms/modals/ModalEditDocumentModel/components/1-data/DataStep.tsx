/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import {
  documentModelDestructiveButtonSx,
  getDocumentModelSaveActionButtonSx,
} from 'components/organisms/tables/DocumentModelTable/document-model-presentation-theme';

import { IUseDocumentModel } from '../../hooks/useEditDocumentModel';
import { DataContent } from './components/DataContent/DataContent';
import { useDataStep } from './hooks/useDataStep';

export const DataStep = (data: IUseDocumentModel) => {
  const props = useDataStep(data);
  const {
    loading,
    onCloseUnsaved,
    onSubmit,
    onSubmitAndExit,
    saveLoading,
    saveAndExitLoading,
    saveBusy,
    isDirty,
  } = props;

  const saveActionColor = isDirty ? 'error' : 'primary';

  const buttons = [
    {
      disabled: saveBusy,
    },
    {
      text: 'Salvar',
      variant: 'contained',
      color: saveActionColor,
      sx: getDocumentModelSaveActionButtonSx(saveActionColor),
      onClick: () => onSubmit(),
      disabled: saveBusy,
      loading: saveLoading,
    },
    {
      text: 'Salvar e sair',
      variant: 'contained',
      color: saveActionColor,
      sx: getDocumentModelSaveActionButtonSx(saveActionColor),
      onClick: () => onSubmitAndExit(),
      disabled: saveBusy,
      loading: saveAndExitLoading,
    },
    ...(data.isEdit && data.handleDelete
      ? [
          {
            text: 'Excluir',
            variant: 'outlined' as const,
            color: 'error' as const,
            sx: documentModelDestructiveButtonSx,
            onClick: data.handleDelete,
            disabled: saveBusy,
          },
        ]
      : []),
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box>
          <DataContent {...props} />
        </Box>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </SFlex>
  );
};
