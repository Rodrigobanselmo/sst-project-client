/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Divider } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { SSwitch } from 'components/atoms/SSwitch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SelectForm } from 'components/molecules/form/select';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ClinicInputSelect } from 'components/organisms/inputSelect/ClinicSelect/ClinicInputSelect';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import { ExamsComplementsClinicTable } from 'components/organisms/tables/ExamsComplementsClinicTable/ExamsComplementsClinicTable';
import { ExamsComplementsTable } from 'components/organisms/tables/ExamsComplementsTable/ExamsComplementsTable';
import { ExamSelect } from 'components/organisms/tagSelects/ExamSelect';
import dayjs from 'dayjs';
import { employeeExamConclusionTypeList } from 'project/enum/employee-exam-history-conclusion.enum';
import { employeeExamEvaluationTypeList } from 'project/enum/employee-exam-history-evaluation.enum';
import { employeeExamTypeList } from 'project/enum/employee-exam-history-type.enum';
import { SexTypeEnum } from 'project/enum/sex.enums';

import { SCheckIcon } from 'assets/icons/SCheckIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { dateToDate } from 'core/utils/date/date-format';
import { get15Time } from 'core/utils/helpers/times';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { timeMask } from 'core/utils/masks/date.mask';
import { intMask } from 'core/utils/masks/int.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { getSexLabel } from '../ModalAddExamSchedule/components/1-employee';
import { useAddData } from './hooks/useAddData';

export const ModalEditEmployeeHisExamClinic = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    data,
    setData,
    control,
    handleSubmit,
    isEdit,
    modalName,
    setValue,
    setComplementaryExam,
    clinicExam,
    complementaryExams,
    setAllComplementaryExamDone,
  } = useAddData();

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setData({ ...data }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        center
        sx={{
          minHeight: ['100%', 420],
          display: 'flex',
          flexDirection: 'column',
          minWidth: ['95%', '95%', 800, 1000],
        }}
        p={8}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Dados Agendamento'}
        />
        <Box mb={10}>
          <SFlex flexWrap="wrap" gap={5} mb={10}>
            <Box flex={2}>
              <InputForm
                defaultValue={data?.name || ''}
                control={control}
                name="name"
                label="Nome do funcionário"
                size="small"
                InputLabelProps={{ shrink: true }}
                labelPosition="center"
                sx={{
                  width: ['100%'],
                }}
              />
            </Box>
            <Box flex={1} maxWidth="200px">
              <InputForm
                defaultValue={cpfMask.mask(data.cpf)}
                placeholder={'000.000.000-00'}
                control={control}
                setValue={setValue}
                name="cpf"
                label="CPF"
                size="small"
                InputLabelProps={{ shrink: true }}
                labelPosition="center"
                sx={{ width: ['100%'] }}
              />
            </Box>
            <Box flex={1} minWidth="250px" maxWidth="150px">
              <RadioForm
                control={control}
                defaultValue={data.sex}
                unmountOnChangeDefault
                name="sex"
                row
                options={[
                  { label: 'Feminino', value: SexTypeEnum.F },
                  { label: 'Masculino', value: SexTypeEnum.M },
                ]}
              />
            </Box>
          </SFlex>

          <SFlex flexWrap="wrap" gap={5}>
            <Box minWidth="300px" flex={1}>
              <InputForm
                defaultValue={data?.email || ''}
                control={control}
                name="email"
                label="Email"
                size="small"
                InputLabelProps={{ shrink: true }}
                labelPosition="center"
                sx={{
                  width: ['100%'],
                }}
              />
            </Box>
            <Box flex={1} minWidth="150px" maxWidth="150px">
              <InputForm
                defaultValue={phoneMask.mask(data?.phone) || ''}
                control={control}
                name="phone"
                label="Telefone"
                size="small"
                InputLabelProps={{ shrink: true }}
                labelPosition="center"
                sx={{
                  width: ['100%'],
                }}
              />
            </Box>
            <Box minWidth="200px" maxWidth="200px">
              <DatePickerForm
                label="Data de Nascimento"
                calendarProps={{
                  excludeDateIntervals: [
                    {
                      start: dayjs().add(-12, 'y').toDate(),
                      end: dayjs().add(100, 'y').toDate(),
                    },
                  ],
                }}
                unmountOnChangeDefault
                size="small"
                control={control}
                defaultValue={dateToDate(data.birthday)}
                name="birthday"
                onChange={(date) => {
                  setData({
                    ...data,
                    birthday: date instanceof Date ? date : undefined,
                  });
                }}
              />
            </Box>
            <Box flex={1} minWidth="80px" maxWidth="80px">
              <SInput
                value={
                  data?.birthday ? dayjs().diff(data.birthday, 'years') : ''
                }
                disabled
                label="Idade"
                size="small"
                InputLabelProps={{ shrink: true }}
                labelPosition="center"
                sx={{
                  width: ['100%'],
                }}
              />
            </Box>
          </SFlex>
        </Box>
        <SText color="text.label">
          {clinicExam?.exam?.name || 'Avaliação Clínica Ocupacional'}
        </SText>
        <Divider sx={{ mb: 10, mt: 3 }} />
        {!!clinicExam && (
          <SFlex direction="column">
            <SFlex flexWrap="wrap" gap={5}>
              <Box maxWidth={200}>
                <DatePickerForm
                  label="Data do exame"
                  control={control}
                  defaultValue={dateToDate(clinicExam.doneDate)}
                  sx={{ minWidth: 200 }}
                  placeholderText="__/__/__"
                  name="doneDate"
                  labelPosition="top"
                  unmountOnChangeDefault
                  calendarProps={{
                    disabled: true,
                  }}
                />
              </Box>
              <Box mr={20} maxWidth={100}>
                <AutocompleteForm
                  name="time"
                  control={control}
                  filterOptions={(x) => x}
                  unmountOnChangeDefault
                  freeSolo
                  getOptionLabel={(option) => String(option)}
                  inputProps={{
                    labelPosition: 'top',
                    placeholder: '00:00',
                    name: 'time',
                  }}
                  setValue={(v) => setValue('time', v)}
                  defaultValue={clinicExam.time || ''}
                  mask={timeMask.apply}
                  label="Hora"
                  options={[]}
                  sx={{ width: [100] }}
                  disabled
                />
              </Box>
              <Box flex={1}>
                <SelectForm
                  unmountOnChangeDefault
                  defaultValue={String(clinicExam.examType || '') || ''}
                  label="Tipo de Exame"
                  control={control}
                  placeholder="selecione..."
                  name="examType"
                  labelPosition="top"
                  size="small"
                  disabled
                  options={employeeExamTypeList}
                />
              </Box>
            </SFlex>

            <SFlex flexWrap="wrap" gap={5} mt={8}>
              <Box flex={2}>
                <ProfessionalInputSelect
                  onChange={(prof) => {
                    setData({
                      ...data,
                      doctor: prof,
                    });
                  }}
                  inputProps={{
                    labelPosition: 'top',
                    placeholder: 'selecione o médico...',
                  }}
                  unmountOnChangeDefault
                  defaultValue={data.doctor || clinicExam.doctor}
                  name="doctor"
                  label="Médico"
                  control={control}
                />
              </Box>
              <Box flex={1}>
                <SelectForm
                  unmountOnChangeDefault
                  defaultValue={String(clinicExam.evaluationType || '') || ''}
                  label="Avaliação"
                  control={control}
                  placeholder="selecione..."
                  name="evaluationType"
                  labelPosition="top"
                  onChange={(e) => {
                    if (e.target.value)
                      setData({
                        ...data,
                        evaluationType: (e as any).target.value,
                      });
                  }}
                  size="small"
                  options={employeeExamEvaluationTypeList}
                />
              </Box>
            </SFlex>
          </SFlex>
        )}

        {complementaryExams && !!complementaryExams.length && (
          <SFlex direction="column" mb={3} mt={15}>
            <SFlex>
              <SText color="text.label" fontSize={16}>
                Exames Complementares
              </SText>
              <STagButton
                ml={5}
                icon={SCheckIcon}
                text={'Marcar todos como realizado'}
                onClick={setAllComplementaryExamDone}
              />
            </SFlex>
            <Divider sx={{ mb: 5, mt: 3 }} />
            <ExamsComplementsClinicTable
              setData={setComplementaryExam}
              data={complementaryExams}
              control={control}
              setValue={setValue}
            />
          </SFlex>
        )}

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
