/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseAddCat } from '../../hooks/useAddCat';
import { CatPrintButton } from './components/CatPrintButton/CatPrintButton';
import { TypeContent } from './components/TypeContent/TypeContent';
import { useAccidentData } from './hooks/useAccidentData';

export const AccidentStep = (data: IUseAddCat) => {
  const props = useAccidentData(data);
  const { loading, onCloseUnsaved, isEdit, onSubmit, previousStep } = props;

  const buttons = [
    {},
    {
      variant: 'outlined',
      text: 'Voltar',
      arrowBack: true,
      onClick: () => previousStep(),
    },
    {
      text: isEdit ? 'Salvar' : 'Proximo',
      arrowNext: !isEdit,
      // disabled: !data.catData.employeeId,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box>
          {isEdit && <CatPrintButton {...props} />}
          <TypeContent {...props} />
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
