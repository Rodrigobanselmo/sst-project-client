import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { HistoryEmployeeExamTable } from 'components/organisms/tables/HistoryEmployeeExamTable/HistoryEmployeeExamTable';

import { IUseEditEmployee } from '../../hooks/useEditEmployee';
import { useExamData } from './hooks/useExamData';

export const ExamHistoryStep = (props: IUseEditEmployee) => {
  const { onSubmit, loading, onCloseUnsaved, isEdit, employee } =
    useExamData(props);

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
        {employee && (
          <HistoryEmployeeExamTable
            employee={employee}
            employeeId={employee.id}
          />
        )}
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </SFlex>
  );
};
