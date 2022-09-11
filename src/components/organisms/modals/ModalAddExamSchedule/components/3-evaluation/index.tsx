import React from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { getCompanyName } from 'components/organisms/main/Header/Location';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { ExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/ExamsScheduleTable';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect ';
import dayjs from 'dayjs';
import {
  employeeExamScheduleTypeList,
  ExamHistoryTypeEnum,
} from 'project/enum/employee-exam-history-type.enum';
import { SexTypeEnum } from 'project/enum/risk.enums copy';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { border_box } from 'core/styles/cssInJsStyles';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseEditEmployee } from '../../hooks/useEditExamEmployee';
import { useEvaluationStep } from './hooks/useEvaluationStep';

const getSexLabel = (sex?: SexTypeEnum) => {
  if (sex === SexTypeEnum.F) return 'Feminino';
  if (sex === SexTypeEnum.M) return 'Masculino';

  return '';
};

export const EvaluationStep = (props: IUseEditEmployee) => {
  const {
    control,
    onSubmit,
    data,
    loading,
    onCloseUnsaved,
    isEdit,
    setValue,
    previousStep,
    setComplementaryExam,
    lastComplementaryDate,
    hasExamsAskSchedule,
  } = useEvaluationStep(props);

  const buttons = [
    {},
    {
      text: 'Voltar',
      arrowBack: true,
      variant: 'outlined',
      onClick: () => previousStep(),
    },
    {
      text: 'Proximo',
      arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box mt={2}>
          <SText color="text.label" fontSize={16}>
            Agendar Exame de Avaliação Clínica Ocupacional
          </SText>
          <Divider sx={{ mb: 5, mt: 3 }} />

          <ExamsScheduleTable
            setData={setComplementaryExam}
            data={data.examsData.filter((x) => x.isAttendance)}
            control={control}
            setValue={setValue}
            hideHeader
            scheduleData={data}
            lastComplementaryDate={lastComplementaryDate}
          />
          <SText fontSize={14}>
            Último resuldado dos exames complementar:{' '}
            <u>{lastComplementaryDate?.format('DD/MM/YYYY')}</u>
          </SText>
          <SText fontSize={12}>
            O Exame clínico so poderá ser marcado após a obtenção dos resultados
            de todos os exames complementares
          </SText>
          {hasExamsAskSchedule && (
            <InputForm
              defaultValue={data.clinicObs}
              label={'Observações do Pedido de Agenda (Exame Clínico)'}
              multiline
              minRows={3}
              maxRows={5}
              control={control}
              placeholder={
                'descreva sua observação referente ao pedido de agenda...'
              }
              name="clinicObs"
              size="small"
            />
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
