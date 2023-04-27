import React from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { ExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/ExamsScheduleTable';
import { ExamSelect } from 'components/organisms/tagSelects/ExamSelect';
import { PermissionEnum } from 'project/enum/permission.enum';
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
    company,
  } = useExamsStep(props);

  const hasExamsAskSchedule = data.examsData?.some(
    (data) =>
      data &&
      data.isSelected &&
      data.scheduleType === ClinicScheduleTypeEnum.ASK,
  );

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
  console.log(data);
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
            company={company}
            companyId={employee?.companyId || company?.id}
          />
          {hasExamsAskSchedule && (
            <InputForm
              defaultValue={data?.obs || ''}
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
            companyId={employee?.companyId}
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

          <SAuthShow permissions={[PermissionEnum.CLINIC_SCHEDULE]} cruds={'u'}>
            <Box flex={1} mt={10}>
              <SText color="text.label" fontSize={14} mb={3}>
                Adicionar outros exame
              </SText>
              <ExamSelect
                sx={{ width: '190px' }}
                asyncLoad
                large
                text={'selecione um exame'}
                multiple={false}
                onlyExam
                query={{ isAttendance: false, isAvaliation: false }}
                handleSelect={(option) => {
                  if (option?.id) {
                    setData({
                      ...data,
                      examsData: [
                        ...data.examsData,
                        {
                          name: option.name,
                          id: option.id,
                          isSelected: true,
                          isAttendance: option.isAttendance,
                          validityInMonths: 0,
                        },
                      ],
                    });
                  }
                }}
              />
            </Box>
          </SAuthShow>
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
