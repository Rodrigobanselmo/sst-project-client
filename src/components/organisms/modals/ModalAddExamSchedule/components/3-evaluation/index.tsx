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
    isPendingExams,
    company,
    getBlockTimeList,
    isLoadingTime,
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
            getBlockTimeList={getBlockTimeList}
            isLoadingTime={isLoadingTime}
            setData={setComplementaryExam}
            data={data.examsData.filter((x) => x.isAttendance)}
            control={control}
            setValue={setValue}
            hideHeader
            scheduleData={data}
            lastComplementaryDate={lastComplementaryDate}
            isPendingExams={isPendingExams}
            company={company}
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
