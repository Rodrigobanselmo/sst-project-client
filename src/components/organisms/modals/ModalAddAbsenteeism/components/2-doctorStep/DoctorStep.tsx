/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SModal, { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseAddAbsenteeism } from '../../hooks/useAddAbsenteeism';
import { EmployeeContent } from '../1-motiveStep/components/EmployeeContent/EmployeeContent';
import { STitleDivider } from '../STitleDivider';
import { DocContent } from './components/DocContent/DocContent';
import { useDoctorData } from './hooks/useDoctorData';

export const DoctorStep = (data: IUseAddAbsenteeism) => {
  const props = useDoctorData(data);
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
      disabled: !data.absenteeismData.employeeId,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box>
          {/* <STitleDivider mb={8}>Atestado médico</STitleDivider> */}
          <DocContent {...props} />
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
