import React from 'react';

import { Box, Divider } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { SSwitch } from 'components/atoms/SSwitch';
import { STag } from 'components/atoms/STag';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { ExamsScheduleTable } from 'components/organisms/tables/ExamsScheduleTable/ExamsScheduleTable';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';
import dayjs from 'dayjs';
import {
  employeeExamScheduleTypeList,
  ExamHistoryTypeEnum,
} from 'project/enum/employee-exam-history-type.enum';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { border_box } from 'core/styles/cssInJsStyles';
import { dateToDate } from 'core/utils/date/date-format';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseEditEmployee } from '../../hooks/useEditExamEmployee';
import { useResumeStep } from './hooks/useResumeStep';

const getSexLabel = (sex?: SexTypeEnum) => {
  if (sex === SexTypeEnum.F) return 'Feminino';
  if (sex === SexTypeEnum.M) return 'Masculino';

  return '';
};

export const ResumeStep = (props: IUseEditEmployee) => {
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
    previousStep,
    setComplementaryExam,
    lastComplementaryDate,
    hasExamsAskSchedule,
    skipHierarchySelect,
  } = useResumeStep(props);

  const buttons = [
    {},
    {
      text: 'Voltar',
      arrowBack: true,
      variant: 'outlined',
      onClick: () => previousStep(),
    },
    {
      text: 'Confirmar',
      // arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  const isDismissal = data.examType == 'DEMI';

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box mt={2}>
          <Box sx={{ input: { fontSize: 14 } }}>
            {employee?.id && (
              <>
                {/* employee */}
                <Box sx={{ ...border_box }} mb={5}>
                  <SFlex flexWrap="wrap" gap={5}>
                    <Box flex={2}>
                      <SInput
                        value={employee?.name || ''}
                        disabled
                        label="Nome do funcionário"
                        superSmall
                        InputLabelProps={{ shrink: true }}
                        labelPosition="center"
                        variant="standard"
                        sx={{
                          width: ['100%'],
                        }}
                      />
                    </Box>
                    <Box flex={1} maxWidth="150px">
                      <SInput
                        value={cpfMask.mask(employee?.cpf) || ''}
                        disabled
                        label="CPF"
                        superSmall
                        InputLabelProps={{ shrink: true }}
                        labelPosition="center"
                        variant="standard"
                        sx={{ width: ['100%'] }}
                      />
                    </Box>
                    <Box flex={1} minWidth="200px">
                      <SInput
                        value={employee?.esocialCode || ''}
                        disabled
                        label="Matrícula (eSocial)"
                        superSmall
                        InputLabelProps={{ shrink: true }}
                        labelPosition="center"
                        variant="standard"
                        sx={{ width: ['100%'] }}
                      />
                    </Box>
                  </SFlex>
                </Box>

                {/* company */}
                <Box sx={{ ...border_box }}>
                  <SFlex flexWrap="wrap" gap={5}>
                    <Box flex={1}>
                      <SInput
                        value={getCompanyName(employee?.company)}
                        disabled
                        label="Nome do Empresa"
                        superSmall
                        InputLabelProps={{ shrink: true }}
                        labelPosition="center"
                        variant="standard"
                        sx={{
                          width: ['100%'],
                        }}
                      />
                    </Box>
                    <Box flex={1} minWidth="150px" maxWidth="150px">
                      <SInput
                        value={cnpjMask.mask(employee?.company?.cnpj) || ''}
                        disabled
                        label="CNPJ"
                        superSmall
                        InputLabelProps={{ shrink: true }}
                        labelPosition="center"
                        variant="standard"
                        sx={{ width: ['100%'] }}
                      />
                    </Box>
                  </SFlex>
                </Box>

                {/* hierarchy */}
                <SFlex flexWrap="wrap" mt={5}>
                  {(newHierarchy || isDismissal) &&
                    data.companyId &&
                    employee?.id && (
                      <Box flex={4} sx={{ ...border_box }}>
                        <SelectForm
                          unmountOnChangeDefault
                          setValue={setValue}
                          disabled
                          defaultValue={String(data.examType || '') || ''}
                          label="Tipo de Exame"
                          control={control}
                          placeholder="selecione..."
                          name="examType"
                          inputProps={{
                            autoFocus: true,
                            disabled: true,
                          }}
                          labelPosition="top"
                          onChange={(e) => {
                            if (e.target.value)
                              setData({
                                ...data,
                                examType: (e as any).target.value,
                              });
                          }}
                          size="small"
                          options={employeeExamScheduleTypeList(employee)}
                          boxProps={{ flex: 1, maxWidth: 320, mb: 5 }}
                        />
                        {!isDismissal && (
                          <SFlex direction="column" gap={4} mb={5}>
                            <SText color="text.label" fontSize={14}>
                              Novo Cargo
                            </SText>
                            <SText color="text.label" fontSize={14}>
                              <SText
                                component="span"
                                color="text.label"
                                fontSize={14}
                                sx={{
                                  backgroundColor: 'grey.50',
                                  p: '2px 10px',
                                  borderRadius: 1,
                                  mr: 5,
                                }}
                              >
                                {employee?.hierarchy?.name || '-'}
                              </SText>
                              {'>'}
                              <SText
                                component="span"
                                color="text.label"
                                fontSize={14}
                                sx={{
                                  backgroundColor: 'grey.50',
                                  p: '2px 10px',
                                  ml: 5,
                                  borderRadius: 1,
                                }}
                              >
                                {data?.hierarchy?.name}
                              </SText>
                            </SText>
                          </SFlex>
                        )}
                        {/* <SSwitch
                          onChange={() => {
                            setData({
                              ...data,
                              changeHierarchyWhenDone:
                                !data.changeHierarchyWhenDone,
                            } as any);
                          }}
                          checked={data.changeHierarchyWhenDone}
                          label="Mudar Cargo assim que exame for realizado?"
                          sx={{ mr: 4, ml: 6 }}
                          color="text.light"
                        /> */}
                        {!skipHierarchySelect &&
                          !data.changeHierarchyWhenDone && (
                            <Box mt={10}>
                              <DatePickerForm
                                label="Data para mudança de cargo"
                                control={control}
                                defaultValue={dateToDate(
                                  data.changeHierarchyDate,
                                )}
                                sx={{ maxWidth: 300, mb: 5 }}
                                placeholderText="__/__/__"
                                name="doneDate"
                                labelPosition="top"
                                unmountOnChangeDefault
                                onChange={(date) => {
                                  setData({
                                    ...data,
                                    changeHierarchyDate:
                                      date instanceof Date ? date : undefined,
                                  });
                                }}
                              />

                              {!isDismissal && (
                                <SCheckBox
                                  label="Ao fazer a admissão ou mudança de cargo do funcionário sem o exame clínico realizado, a sua empresa poderá receber multas do eSocial. Você deja mudar o cargo na data escolhida mesmo com o exame clínico não concluido sabendo das possíveis consequências descritas a cima?"
                                  checked={data.changeHierarchyAnyway}
                                  onChange={(e) => {
                                    setData({
                                      ...data,
                                      changeHierarchyAnyway:
                                        !data.changeHierarchyAnyway,
                                    } as any);
                                  }}
                                />
                              )}
                            </Box>
                          )}
                      </Box>
                    )}
                </SFlex>
              </>
            )}
          </Box>
          <SText color="text.label" fontSize={16} mt={10}>
            Resumo dos Agendamentos
          </SText>
          <Divider sx={{ mb: 5, mt: 3 }} />

          <ExamsScheduleTable
            setData={setComplementaryExam}
            data={data.examsData
              .sort(
                (a, b) => -(a.isAttendance ? 1 : 0) + (b.isAttendance ? 1 : 0),
              )
              .filter((x) => x.isSelected)}
            control={control}
            disabled
            setValue={setValue}
            hideHeader
            hideInstruct
            scheduleData={data}
            lastComplementaryDate={lastComplementaryDate}
            companyId={employee?.companyId}
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
