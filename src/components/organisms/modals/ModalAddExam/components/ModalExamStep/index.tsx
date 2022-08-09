/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dynamic from 'next/dynamic';
import { StatusEnum } from 'project/enum/status.enum';

import { examsOptionsList } from 'core/constants/maps/exams.map';
import { ExamTypeEnum } from 'core/interfaces/api/IExam';

import { IUseEditExam } from '../../hooks/useEditExams';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

export const ModalExamStep = ({
  examData,
  control,
  setExamData,
}: IUseEditExam) => {
  return (
    <SFlex sx={{ minWidth: [300, 600, 800] }} direction="column" mt={8}>
      <SText color="text.label" mb={5} fontSize={14}>
        Dados Pessoais
      </SText>

      <InputForm
        autoFocus
        defaultValue={examData.name}
        label="Nome*"
        labelPosition="center"
        control={control}
        placeholder={'nome do exame...'}
        name="name"
        size="small"
      />

      <SFlex mt={5} flexWrap="wrap" gap={5}>
        <Box flex={5}>
          <InputForm
            defaultValue={examData.analyses}
            label="Análise"
            labelPosition="center"
            control={control}
            placeholder={'ex: quantitativo, imagem...'}
            name="analyses"
            size="small"
          />
        </Box>
        <Box flex={8}>
          <InputForm
            defaultValue={examData.material}
            label="Material"
            labelPosition="center"
            control={control}
            placeholder={'ex: sangue, urina...'}
            name="material"
            size="small"
          />
        </Box>
      </SFlex>

      <RadioForm
        sx={{ mt: 8 }}
        label="Selecione o tipo de exame*"
        control={control}
        defaultValue={String(examData?.type)}
        name="type"
        row
        options={examsOptionsList.map((examType) => ({
          label: examType.name,
          value: examType.value,
        }))}
      />
      {/* <RadioFormText
        ball
        type="radio"
        label="Tipo"
        control={control}
        defaultValue={String(examData.type)}
        onChange={(e) => {
          const type = (e as any).target.value as ExamTypeEnum;

          setExamData((old) => ({
            ...old,
            type,
          }));
        }}
        options={examsOptionsList.map((examType) => ({
          content: examType.name,
          value: examType.value,
        }))}
        name="type"
        columns={3}
        mt={5}
      /> */}
      <DraftEditor
        size="xs"
        mt={10}
        label="instruções"
        placeholder="instruções..."
        defaultValue={examData.instruction}
        onChange={(value) => {
          setExamData({
            ...examData,
            instruction: value,
          });
        }}
      />
      {/* {examData.id && ( */}
      <SSwitch
        onChange={() => {
          setExamData({
            ...examData,
            isAttendance: !examData.isAttendance,
          });
        }}
        checked={examData.isAttendance}
        label="Atendimento (ASO)"
        sx={{ mr: 4 }}
        color="text.light"
      />
      {/* )} */}
      {!!examData.id && (
        <StatusSelect
          sx={{ maxWidth: '90px', mt: 10 }}
          selected={examData.status}
          statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
          handleSelectMenu={(option) =>
            setExamData((old) => ({
              ...old,
              status: option.value,
            }))
          }
        />
      )}
    </SFlex>
  );
};
