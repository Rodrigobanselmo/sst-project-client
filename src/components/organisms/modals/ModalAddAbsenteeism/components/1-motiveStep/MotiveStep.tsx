/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SModal, { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseAddAbsenteeism } from '../../hooks/useAddAbsenteeism';
import { STitleDivider } from '../STitleDivider';
import { EmployeeContent } from './components/EmployeeContent/EmployeeContent';
import { MotiveContent } from './components/MotiveContent/MotiveContent';
import { TimeAwayContent } from './components/TimeAwayContent/TimeAwayContent';
import { useMotiveData } from './hooks/useMotiveData';

export const MotiveStep = (data: IUseAddAbsenteeism) => {
  const props = useMotiveData(data);
  const { loading, onCloseUnsaved, isEdit, onSubmit } = props;

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Proximo',
      arrowNext: !isEdit,
      disabled: !data.absenteeismData.employeeId,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box>
          <STitleDivider mb={8}>Funcionário</STitleDivider>
          <EmployeeContent {...props} />
          <STitleDivider mt={20}>Ausência / Afastamento</STitleDivider>

          {!!data.absenteeismData.employeeId && (
            <>
              <TimeAwayContent {...props} />

              <MotiveContent {...props} />
            </>
          )}
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
