/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { RadioForm } from 'components/molecules/form/radio';
import { ExamInputSelect } from 'components/organisms/inputSelect/ExamSelect/ExamSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { IUseEditClinicExam } from '../../hooks/useEditClinicExams';

export const ModalClinicExamStep = ({
  clinicExamData,
  control,
  setClinicExamData,
  isEdit,
}: IUseEditClinicExam) => {
  return (
    <SFlex sx={{ minWidth: [300, 600, 800] }} direction="column" mt={8}>
      <SText color="text.label" mb={5} fontSize={14}>
        Dados Pessoais
      </SText>

      <ExamInputSelect
        onChange={(exam) => {
          setClinicExamData({
            ...clinicExamData,
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
        label="Exame*"
        control={control}
      />

      <AutocompleteForm
        name="dueInDays"
        control={control}
        freeSolo
        inputProps={{
          labelPosition: 'top',
          placeholder: 'em dias...',
        }}
        label="Prazo (dias)"
        sx={{ width: [200], mt: 5 }}
        options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      />

      <RadioForm
        sx={{ mt: 8 }}
        label="Selecione o tipo de exame*"
        control={control}
        defaultValue={isEdit ? (clinicExamData.isScheduled ? 1 : 0) : undefined}
        name="type"
        row
        options={[
          { label: 'Hora agendada', value: 1 },
          { label: 'Ordem de chegada', value: 0 },
        ]}
      />

      {!!clinicExamData.id && (
        <StatusSelect
          sx={{ maxWidth: '90px', mt: 10 }}
          selected={clinicExamData.status}
          statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
          handleSelectMenu={(option) =>
            setClinicExamData((old) => ({
              ...old,
              status: option.value,
            }))
          }
        />
      )}
    </SFlex>
  );
};
