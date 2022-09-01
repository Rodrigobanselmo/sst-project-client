import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import dayjs from 'dayjs';
import { SexTypeEnum } from 'project/enum/risk.enums copy';

import { dateToDate } from 'core/utils/date/date-format';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { IUseEditEmployee } from '../../hooks/useEditExamEmployee';
import { useEmployeeStep } from './hooks/useEmployeeStep';

export const EmployeeStep = (props: IUseEditEmployee) => {
  const { control, onSubmit, data, loading, onCloseUnsaved, isEdit, setData } =
    useEmployeeStep(props);

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Proximo',
      arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <SText color="text.label" fontSize={14} mb={5}>
          Identificação
        </SText>
        <EmployeeSelect
          preload
          maxWidth="100%"
          maxPerPage={10}
          handleSelect={(employee) => console.log(employee)}
          text={'Selecionar Funcionario'}
          addButton={false}
          queryEmployee={{ all: true }}
          tooltipTitle="Encontrar funcionário"
          // handleSelect={(_, list) =>
          //   setData((old) => ({ ...old, selectedEmployees: list }))
          // }
          selectedEmployees={[]}
          multiple={false}
        />
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </SFlex>
  );
};
