/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SelectForm } from 'components/molecules/form/select';
import { ExamInputSelect } from 'components/organisms/inputSelect/ExamSelect/ExamSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { StatusEnum } from 'project/enum/status.enum';

import { clinicScheduleOptionsList } from 'core/constants/maps/clinic-schedule-type.map';
import { dateToDate } from 'core/utils/date/date-format';
import { getMoney } from 'core/utils/helpers/getMoney.utils';
import { floatMask } from 'core/utils/masks/float.mask';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseEditClinicExam } from '../../hooks/useEditClinicExams';
import { ShiftTimeSelect } from '../ShiftTimeSelect/ShiftTimeSelect';
import { STagButton } from 'components/atoms/STagButton';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

export const ModalClinicExamStep = ({
  clinicExamData,
  control,
  setClinicExamData,
  isEdit,
  setValue,
  onSelectCheck,
  isDocConsult,
  onDelete,
  loadDelete,
}: IUseEditClinicExam) => {
  return (
    <SFlex sx={{ minWidth: [300, 600, 800] }} direction="column" mt={8}>
      <SText color="text.label" mb={5} fontSize={14}>
        Dados Pessoais
      </SText>

      <ExamInputSelect
        unmountOnChangeDefault
        onChange={(exam) => {
          const isAvaliation = exam?.isAvaliation;
          setClinicExamData({
            ...clinicExamData,
            ...(isAvaliation && {
              isPeriodic: false,
              isChange: false,
              isAdmission: false,
              isReturn: false,
              isDismissal: false,
            }),
            exam,
          });
        }}
        clearOnBlur={false}
        clearOnEscape={false}
        inputProps={{
          labelPosition: 'top',
          placeholder: 'selecione o exame...',
          autoFocus: true,
        }}
        defaultValue={clinicExamData.exam}
        name="exam"
        label="Nome do Exame*"
        control={control}
      />

      <SFlex mt={10} flexWrap="wrap" gap={5}>
        <Box>
          <SelectForm
            unmountOnChangeDefault
            setValue={setValue}
            defaultValue={String(clinicExamData.scheduleType || '') || ''}
            label="Forma de Agendamento*"
            control={control}
            placeholder="agendamento..."
            name="scheduleType"
            labelPosition="top"
            optionsFieldName={{ contentField: 'name' }}
            sx={{ width: [300] }}
            size="small"
            options={clinicScheduleOptionsList}
          />
        </Box>
        <Box>
          <AutocompleteForm
            name="dueInDays"
            control={control}
            freeSolo
            getOptionLabel={(option) => String(option)}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'em dias...',
              name: 'dueInDays',
            }}
            setValue={(v) => setValue('dueInDays', String(v) || '')}
            defaultValue={clinicExamData.dueInDays}
            mask={intMask.apply}
            label="Prazo para resultado (dias)"
            sx={{ width: [200] }}
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          />
        </Box>
      </SFlex>
      <SText color="text.label" fontSize={14} mt={6} mb={-2}>
        Disponibilizar o exame para:
      </SText>
      <SFlex>
        <SCheckBox
          label="Admissional"
          checked={clinicExamData.isAdmission}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isAdmission');
          }}
        />
        <SCheckBox
          label="Periódico"
          checked={clinicExamData.isPeriodic}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isPeriodic');
          }}
        />
        <SCheckBox
          label="Mudança"
          checked={clinicExamData.isChange}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isChange');
          }}
        />
        <SCheckBox
          label="Retorno"
          checked={clinicExamData.isReturn}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isReturn');
          }}
        />
        <SCheckBox
          label="Demissional"
          checked={clinicExamData.isDismissal}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isDismissal');
          }}
        />
      </SFlex>
      <RadioForm
        sx={{ mt: 8 }}
        label="Selecione o tipo de atendimento*"
        setValue={setValue}
        control={control}
        defaultValue={isEdit ? (clinicExamData.isScheduled ? 1 : 0) : undefined}
        name="type"
        row
        options={[
          { label: 'Hora agendada', value: 1 },
          { label: 'Ordem de chegada', value: 0 },
        ]}
      />

      <SFlex mt={8} flexWrap="wrap" gap={5}>
        {isDocConsult && (
          <Box flex={2} mt={5} mr={20}>
            <InputForm
              label="Duração do atendimento (min)"
              control={control}
              placeholder={'0'}
              defaultValue={String(clinicExamData.examMinDuration || '') || ''}
              endAdornment={'minutos'}
              mask={floatMask.apply({
                negative: false,
                decimal: 0,
              })}
              setValue={setValue}
              name="examMinDuration"
              sx={{ width: [250] }}
              size="small"
            />
          </Box>
        )}
        <Box flex={10} mt={5}>
          <InputForm
            label="Preço"
            control={control}
            defaultValue={getMoney(clinicExamData.price) || ''}
            placeholder={'0,00'}
            startAdornment={'R$'}
            setValue={setValue}
            mask={floatMask.apply({
              negative: false,
              decimal: 2,
            })}
            name="price"
            sx={{ width: [140] }}
            size="small"
          />
        </Box>
      </SFlex>

      {(clinicExamData.scheduleRange !== undefined ||
        (clinicExamData.initialized && !isEdit)) && (
        <ShiftTimeSelect
          defaultSchedule={clinicExamData.scheduleRange}
          onChange={(schedule) =>
            setClinicExamData((old) => ({
              ...old,
              scheduleRange: schedule,
            }))
          }
          mt={10}
        />
      )}

      {isEdit && (
        <DraftEditor
          size="xs"
          mt={5}
          label="Orservações"
          placeholder="descrição..."
          defaultValue={clinicExamData.observation}
          onChange={(value) => {
            setClinicExamData({
              ...clinicExamData,
              observation: value,
            });
          }}
        />
      )}

      <SFlex mt={10} flexWrap="wrap" gap={5}>
        <Box flex={1} maxWidth={200}>
          <DatePickerForm
            label="Data de início"
            control={control}
            defaultValue={dateToDate(clinicExamData.startDate)}
            name="startDate"
            onChange={(date) => {
              setClinicExamData({
                ...clinicExamData,
                endDate: undefined,
                startDate: date instanceof Date ? date : undefined,
              });
            }}
          />
        </Box>
        {clinicExamData.endDate && (
          <Box flex={1} maxWidth={200}>
            <DatePickerForm
              label="Data fim"
              control={control}
              uneditable
              defaultValue={dateToDate(clinicExamData.endDate)}
              name="endDate"
              onChange={(date) => {
                setClinicExamData({
                  ...clinicExamData,
                  endDate: date instanceof Date ? date : undefined,
                });
              }}
            />
          </Box>
        )}
      </SFlex>

      {!!clinicExamData.id && (
        <SFlex sx={{ maxWidth: '90px', mt: 10, gap: 8 }}>
          <StatusSelect
            selected={clinicExamData.status}
            statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
            handleSelectMenu={(option) =>
              setClinicExamData((old) => ({
                ...old,
                status: option.value,
              }))
            }
          />
          <STagButton
            large
            onClick={() => onDelete(clinicExamData.id)}
            icon={SDeleteIcon}
            text={'Deletar'}
            loading={loadDelete}
            disabled={loadDelete}
            borderActive="error"
            iconProps={{ sx: { color: 'error.dark' } }}
          />
        </SFlex>
      )}
    </SFlex>
  );
};
