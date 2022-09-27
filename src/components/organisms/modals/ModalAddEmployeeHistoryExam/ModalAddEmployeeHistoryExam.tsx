/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, Divider } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ClinicInputSelect } from 'components/organisms/inputSelect/ClinicSelect/ClinicInputSelect';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import { ExamsComplementsTable } from 'components/organisms/tables/ExamsComplementsTable/ExamsComplementsTable';
import { ExamSelect } from 'components/organisms/tagSelects/ExamSelect';
import dayjs from 'dayjs';
import { employeeExamConclusionTypeList } from 'project/enum/employee-exam-history-conclusion.enum';
import { employeeExamEvaluationTypeList } from 'project/enum/employee-exam-history-evaluation.enum';
import { employeeExamTypeList } from 'project/enum/employee-exam-history-type.enum';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { dateToDate } from 'core/utils/date/date-format';
import { get15Time } from 'core/utils/helpers/times';
import { timeMask } from 'core/utils/masks/date.mask';
import { intMask } from 'core/utils/masks/int.mask';

import { ModalAddProfessional } from '../ModalAddProfessional/ModalAddProfessional';
import { useAddData } from './hooks/useAddData';

export const ModalAddEmployeeHistoryExam = () => {
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
    isAllFields,
    modalName,
    handleDelete,
    setValue,
    addExam,
    setComplementaryExam,
    hideClinicExam,
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
          title={isEdit ? 'Editar exame' : 'Lançamento de novo exame'}
          secondIcon={data?.id ? SDeleteIcon : undefined}
          secondIconClick={handleDelete}
        />
        <SFlex justify="space-between">
          <SText color="text.label">
            {data?.exam?.name || 'Avaliação Clínica Ocupacional'}
          </SText>
          {!isEdit && (
            <SSwitch
              onChange={() => {
                setData({
                  ...data,
                  hideClinicExam: !data.hideClinicExam,
                });
              }}
              checked={!data.hideClinicExam}
              label="Adicionar exame clínico"
              sx={{ mr: 4, ml: 6 }}
              color="text.light"
            />
          )}
        </SFlex>
        <Divider sx={{ mb: 10, mt: 3 }} />
        {(isEdit || !hideClinicExam) && (
          <SFlex direction="column">
            <SFlex flexWrap="wrap" gap={5}>
              <Box maxWidth={200}>
                <DatePickerForm
                  label="Data do exame"
                  control={control}
                  defaultValue={dateToDate(data.doneDate)}
                  sx={{ minWidth: 200 }}
                  placeholderText="__/__/__"
                  name="doneDate"
                  labelPosition="top"
                  unmountOnChangeDefault
                  onChange={(date) => {
                    setData({
                      ...data,
                      doneDate: date instanceof Date ? date : undefined,
                    });
                  }}
                />
              </Box>
              {isAllFields && (
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
                    defaultValue={data.time || ''}
                    mask={timeMask.apply}
                    label="Hora"
                    sx={{ width: [100] }}
                    options={get15Time(0, 0, 23, 59)}
                  />
                </Box>
              )}
              <Box maxWidth={200}>
                <InputForm
                  label="Validade"
                  control={control}
                  sx={{ minWidth: 100 }}
                  placeholder={'meses'}
                  name="validityInMonths"
                  size="small"
                  labelPosition="top"
                  mask={intMask.apply}
                  value={data.validityInMonths}
                  onChange={(e) =>
                    setData({
                      ...data,
                      validityInMonths:
                        Number(e.target.value || 0) || undefined,
                    })
                  }
                />
              </Box>
              <Box maxWidth={200}>
                <SDatePicker
                  label="Vencimento"
                  uneditable
                  inputProps={{
                    sx: { minWidth: 200 },
                    labelPosition: 'top',
                  }}
                  selected={dayjs(data.doneDate)
                    .add(data.validityInMonths || 0, 'month')
                    .toDate()}
                  onChange={() => null}
                />
              </Box>
            </SFlex>

            <SFlex flexWrap="wrap" gap={5} mt={8}>
              <Box flex={1}>
                <SelectForm
                  unmountOnChangeDefault
                  defaultValue={String(data.examType || '') || ''}
                  label="Tipo de Exame"
                  control={control}
                  placeholder="selecione..."
                  name="examType"
                  labelPosition="top"
                  onChange={(e) => {
                    if (e.target.value)
                      setData({
                        ...data,
                        examType: (e as any).target.value,
                      });
                  }}
                  size="small"
                  options={employeeExamTypeList}
                />
              </Box>
              <Box flex={2}>
                <ClinicInputSelect
                  onChange={(clinic) => {
                    setData({
                      ...data,
                      clinic,
                    });
                  }}
                  inputProps={{
                    labelPosition: 'top',
                    placeholder: 'selecione a clínica...',
                  }}
                  unmountOnChangeDefault
                  defaultValue={data.clinic}
                  name="clinic"
                  label="Clínica"
                  control={control}
                  query={{}}
                />
              </Box>
              {isAllFields && (
                <Box flex={2}>
                  <ProfessionalInputSelect
                    addProfessionalInitProps={{ companyId: data.clinic?.id }}
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
                    defaultValue={data.doctor}
                    name="doctor"
                    label="Médico"
                    control={control}
                  />
                </Box>
              )}
            </SFlex>

            {isAllFields && (
              <SFlex flexWrap="wrap" gap={5} mt={8}>
                <Box flex={1}>
                  <SelectForm
                    unmountOnChangeDefault
                    defaultValue={String(data.evaluationType || '') || ''}
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
                <Box flex={1}>
                  <SelectForm
                    unmountOnChangeDefault
                    defaultValue={String(data.conclusion || '') || ''}
                    label="Conclusão"
                    control={control}
                    placeholder="selecione..."
                    name="conclusion"
                    labelPosition="top"
                    onChange={(e) => {
                      if (e.target.value)
                        setData({
                          ...data,
                          conclusion: (e as any).target.value,
                        });
                    }}
                    size="small"
                    options={employeeExamConclusionTypeList}
                  />
                </Box>
              </SFlex>
            )}
          </SFlex>
        )}

        {!isEdit && (
          <SFlex direction="column" mb={3} mt={15}>
            <SText color="text.label" fontSize={16}>
              Exames Complementares
            </SText>
            <Divider sx={{ mb: 5, mt: 3 }} />
            <ExamsComplementsTable
              setData={setComplementaryExam}
              data={data.examsData}
              control={control}
              setValue={setValue}
            />
            <SFlex>
              <Box flex={1}>
                <ExamSelect
                  sx={{ minWidth: '100%' }}
                  asyncLoad
                  large
                  text={'Adicionar exame complementar'}
                  tooltipTitle={''}
                  multiple={false}
                  onlyExam
                  handleSelect={(option: any) => option && addExam(option)}
                />
              </Box>
            </SFlex>
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

export const StackModalAddEmployeeHistoryExam = () => {
  return (
    <>
      <ModalAddProfessional />
    </>
  );
};
