import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { HistoryEmployeeHierarchyTable } from 'components/organisms/tables/HistoryEmployeeHierarchyTable/HistoryEmployeeHierarchyTable';
import dayjs from 'dayjs';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { dateToDate } from 'core/utils/date/date-format';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { IUseEditEmployee } from '../../hooks/useEditEmployee';
import { useHierarchyData } from './hooks/useHierarchyData';

export const HierarchyHistoryStep = (props: IUseEditEmployee) => {
  const { control, onSubmit, data, loading, onCloseUnsaved, isEdit, setData } =
    useHierarchyData(props);

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
        {/* <SText color="text.label" fontSize={14} mb={5}>
          Identificação
        </SText> */}
        <HistoryEmployeeHierarchyTable
          employee={data as any}
          employeeId={data.id}
          companyId={data.companyId}
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
