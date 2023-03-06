/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseDocumentModel } from '../../hooks/useEditDocumentModel';
import { CatPrintButton } from '../3-accidentStep/components/CatPrintButton/CatPrintButton';
import { DataContent } from './components/DataContent/DataContent';
import { useDataStep } from './hooks/useDataStep';

export const DataStep = (data: IUseDocumentModel) => {
  const props = useDataStep(data);
  const { loading, onCloseUnsaved, onSubmit } = props;

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
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
