import React from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { ExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/ExamsScheduleTable';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';

import { IUseEditEmployee } from '../../hooks/useEditExamEmployee';
import { useExamsStep } from './hooks/useExamsStep';

const getSexLabel = (sex?: SexTypeEnum) => {
  if (sex === SexTypeEnum.F) return 'Feminino';
  if (sex === SexTypeEnum.M) return 'Masculino';

  return '';
};

export const ExamStep = (props: IUseEditEmployee) => {
  const {
    control,
    onSubmit,
    employee,
    data,
    loading,
    onCloseUnsaved,
    isEdit,
    setData,
    setValue,
    notInHierarchy,
    newHierarchy,
    isPendingExams,
    previousStep,
    setComplementaryExam,
  } = useExamsStep(props);

  const hasExamsAskSchedule = data.examsData?.some(
    (data) =>
      data &&
      data.isSelected &&
      data.scheduleType === ClinicScheduleTypeEnum.ASK,
  );
  console.log(data);

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
            Agendar Exames Complementares
          </SText>
          <Divider sx={{ mb: 5, mt: 3 }} />
          <ExamsScheduleTable
            setData={setComplementaryExam}
            data={data.examsData.filter((x) => x.isSelected && !x.isAttendance)}
            control={control}
            setValue={setValue}
            hideHeader
            scheduleData={data}
            isPendingExams={isPendingExams}
          />
          {hasExamsAskSchedule && data.obs && (
            <InputForm
              defaultValue={data.obs}
              label={'Observações do Pedido de Agenda'}
              multiline
              minRows={3}
              disabled={isPendingExams}
              maxRows={5}
              control={control}
              placeholder={
                isPendingExams
                  ? 'nenhum observação'
                  : 'descreva sua observação referente ao pedido de agenda...'
              }
              name="obs"
              size="small"
            />
          )}
          <SText color="text.label" fontSize={16} mt={10}>
            {isPendingExams ? 'Exames Agendados' : 'Exames na válidade'}
          </SText>
          <Divider sx={{ mb: 5, mt: 3 }} />
          <ExamsScheduleTable
            setData={setComplementaryExam}
            data={data.examsData.filter(
              (x) => !x.isSelected && !x.isAttendance,
            )}
            control={control}
            setValue={setValue}
            hideHeader
            scheduleData={data}
            isPendingExams={isPendingExams}
          />
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
