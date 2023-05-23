import React, { useState } from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { ExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/ExamsScheduleTable';
import dayjs from 'dayjs';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { dateToDate } from 'core/utils/date/date-format';
import {
  getRiskDegreeBlockDays,
  isShouldDemissionBlock,
} from 'core/utils/helpers/demissionalBlockCalc';

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
    employee,
    isComplementarySelected,
    isEval,
    setData,
    isDismissalExam,
    isDismissal,
    clinicExamDoneDate,
    isToBlockDismissal,
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
            {isEval
              ? 'Agendar Consulta Médica'
              : 'Agendar Exame de Avaliação Clínica Ocupacional'}
          </SText>
          <Divider sx={{ mb: 5, mt: 3 }} />
          <ExamsScheduleTable
            getBlockTimeList={getBlockTimeList}
            isLoadingTime={isLoadingTime}
            setData={setComplementaryExam}
            data={data.examsData
              .filter((x) => (isEval ? x.isAvaliation : x.isAttendance))
              .map((examData) => {
                return {
                  ...examData,
                  ...(isDismissalExam &&
                    isDismissal && {
                      isSelected: false,
                      expiredDate: null,
                    }),
                };
              })}
            control={control}
            setValue={setValue}
            hideHeader
            scheduleData={data}
            lastComplementaryDate={lastComplementaryDate}
            isPendingExams={isPendingExams}
            companyId={employee?.companyId || company?.id}
            company={company}
            {...(isEval && {
              lastComplementaryDate: undefined,
            })}
          />
          {isDismissal && (
            <DatePickerForm
              label="Data da demissão"
              control={control}
              defaultValue={dateToDate(data.changeHierarchyDate)}
              sx={{ maxWidth: 300, mb: 5 }}
              placeholderText="__/__/__"
              name="doneDate"
              labelPosition="top"
              unmountOnChangeDefault
              onChange={(date) => {
                setData({
                  ...data,
                  changeHierarchyDate: date instanceof Date ? date : undefined,
                });
              }}
            />
          )}

          {isDismissal && (
            <>
              <SText fontSize={15}>
                Exame demissional {isToBlockDismissal ? 'não' : ''} necessario
              </SText>
              <SText fontSize={12}>
                Último exame clinico:{' '}
                {clinicExamDoneDate
                  ? `${dayjs(data.changeHierarchyDate).diff(
                      clinicExamDoneDate,
                      'days',
                    )} dias atrás`
                  : ''}
              </SText>
              <SText fontSize={12}>
                Bloquar exame demissional antes de{' '}
                {getRiskDegreeBlockDays(company) == 90
                  ? '90 dias (Grau de risco 3 e 4)'
                  : '135 dias (Grau de risco 1 e 2)'}
              </SText>
            </>
          )}

          {isComplementarySelected && !isEval && (
            <>
              <SText fontSize={14}>
                Último resuldado dos exames complementar:{' '}
                <u>{lastComplementaryDate?.format('DD/MM/YYYY')}</u>
              </SText>
              <SText fontSize={12}>
                O Exame clínico so poderá ser marcado após a obtenção dos
                resultados de todos os exames complementares
              </SText>
            </>
          )}
          {hasExamsAskSchedule && (
            <InputForm
              defaultValue={data.clinicObs}
              label={'Observações do Pedido de Agenda (Exame Clínico)'}
              setValue={setValue}
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
