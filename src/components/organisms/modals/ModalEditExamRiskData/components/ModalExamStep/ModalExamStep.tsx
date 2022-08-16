/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';

import { dateToString } from 'core/utils/date/date-format';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseEditExam } from '../../hooks/useEditExams';

export const ModalExamStep = ({
  examData,
  onSelectCheck,
  control,
  setValue,
}: IUseEditExam) => {
  return (
    <SFlex direction="column" mt={8}>
      <SText color="text.label" fontSize={14} mb={-2}>
        Periodicidade dos exames
      </SText>
      <SFlex>
        <SCheckBox
          label="Admissional"
          checked={examData.examRiskData.isAdmission}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isAdmission');
          }}
        />
        <SCheckBox
          label="Periódico"
          checked={examData.examRiskData.isPeriodic}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isPeriodic');
          }}
        />
        <SCheckBox
          label="Mudança"
          checked={examData.examRiskData.isChange}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isChange');
          }}
        />
        <SCheckBox
          label="Retorno"
          checked={examData.examRiskData.isReturn}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isReturn');
          }}
        />
        <SCheckBox
          label="Demissional"
          checked={examData.examRiskData.isDismissal}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isDismissal');
          }}
        />
      </SFlex>
      <Box>
        <AutocompleteForm
          name="validityInMonths"
          control={control}
          freeSolo
          getOptionLabel={(option) => String(option)}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'em dias...',
            name: 'validityInMonths',
          }}
          setValue={(v) => setValue('validityInMonths', v)}
          defaultValue={examData.examRiskData.validityInMonths || ''}
          mask={intMask.apply}
          label="Validade (meses)"
          sx={{ width: [200] }}
          options={[3, 6, 9, 12, 18, 24]}
        />
      </Box>
      <SText color="text.label" fontSize={14} mb={-2}>
        Sexo
      </SText>
      <SFlex>
        <SCheckBox
          label="Masculino"
          checked={examData.examRiskData.isMale}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isMale');
          }}
        />
        <SCheckBox
          label="Feminino"
          checked={examData.examRiskData.isFemale}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isFemale');
          }}
        />
      </SFlex>
      <SText color="text.label" fontSize={14} mb={3}>
        Faixa etária
      </SText>
      <SFlex minWidth={['100%', 600, 800]} flexWrap="wrap" gap={5}>
        <Box flex={1} maxWidth={150}>
          <InputForm
            defaultValue={String(examData.examRiskData.fromAge || '')}
            label="De"
            fullWidth
            labelPosition="center"
            control={control}
            endAdornment="anos"
            name="fromAge"
            size="small"
          />
        </Box>
        <Box flex={1} maxWidth={150}>
          <InputForm
            defaultValue={String(examData.examRiskData.toAge || '')}
            fullWidth
            label="Até"
            labelPosition="center"
            control={control}
            endAdornment="anos"
            name="toAge"
            size="small"
          />
        </Box>
      </SFlex>
    </SFlex>
  );
};
