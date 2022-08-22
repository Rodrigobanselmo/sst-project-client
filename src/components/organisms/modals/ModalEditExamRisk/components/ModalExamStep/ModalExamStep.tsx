/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { ExamSelect } from 'components/organisms/tagSelects/ExamSelect';
import { RiskSelect } from 'components/organisms/tagSelects/RiskSelect';

import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { isQuantity } from 'core/utils/helpers/isQuantity';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseEditExam } from '../../hooks/useEditExams';

export const ModalExamStep = ({
  examData,
  onSelectCheck,
  control,
  setValue,
  setExamData,
}: IUseEditExam) => {
  return (
    <SFlex direction="column" mt={8}>
      <SText color="text.label" fontSize={14} mb={-2}>
        Periodicidade dos exames
      </SText>
      <SFlex>
        <SCheckBox
          label="Admissional"
          checked={examData.isAdmission}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isAdmission');
          }}
        />
        <SCheckBox
          label="Periódico"
          checked={examData.isPeriodic}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isPeriodic');
          }}
        />
        <SCheckBox
          label="Mudança"
          checked={examData.isChange}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isChange');
          }}
        />
        <SCheckBox
          label="Retorno"
          checked={examData.isReturn}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isReturn');
          }}
        />
        <SCheckBox
          label="Demissional"
          checked={examData.isDismissal}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isDismissal');
          }}
        />
      </SFlex>

      <SText color="text.label" fontSize={14} mb={-2} mt={10}>
        Sexo
      </SText>
      <SFlex>
        <SCheckBox
          label="Masculino"
          checked={examData.isMale}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isMale');
          }}
        />
        <SCheckBox
          label="Feminino"
          checked={examData.isFemale}
          onChange={(e) => {
            onSelectCheck(e.target?.checked, 'isFemale');
          }}
        />
      </SFlex>

      <SText color="text.label" fontSize={14} mb={3} mt={5}>
        Faixa etária
      </SText>
      <SFlex minWidth={['100%', 600, 800]} flexWrap="wrap" gap={5}>
        <Box flex={1} maxWidth={150}>
          <InputForm
            defaultValue={String(examData.fromAge || '')}
            label="De"
            fullWidth
            labelPosition="center"
            control={control}
            endAdornment="anos"
            name="fromAge"
            size="small"
            mask={intMask.apply}
          />
        </Box>
        <Box flex={1} maxWidth={150}>
          <InputForm
            defaultValue={String(examData.toAge || '')}
            fullWidth
            label="Até"
            labelPosition="center"
            control={control}
            endAdornment="anos"
            name="toAge"
            size="small"
            mask={intMask.apply}
          />
        </Box>
      </SFlex>

      <SFlex gap={5} mt={10} flexWrap="wrap">
        <AutocompleteForm
          name="validityInMonths"
          control={control}
          freeSolo
          getOptionLabel={(option) => String(option)}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'meses...',
            name: 'validityInMonths',
          }}
          setValue={(v) => setValue('validityInMonths', v)}
          defaultValue={examData.validityInMonths || ''}
          mask={intMask.apply}
          label="Validade (meses)"
          sx={{ width: [200] }}
          options={[3, 6, 9, 12, 18, 24]}
        />
        <AutocompleteForm
          name="lowValidityInMonths"
          control={control}
          freeSolo
          getOptionLabel={(option) => String(option)}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'meses...',
            name: 'lowValidityInMonths',
          }}
          setValue={(v) => setValue('lowValidityInMonths', v)}
          defaultValue={examData.lowValidityInMonths || ''}
          mask={intMask.apply}
          label="Validade para comorbidades (meses)"
          sx={{ width: [300] }}
          options={[3, 6, 9, 12, 18, 24]}
        />
      </SFlex>
      <RiskSelect
        sx={{ minWidth: '100%', mt: 10, overflow: 'hidden' }}
        large
        error={examData.error.risk}
        active={!!examData.risk?.id}
        tooltipTitle={examData.risk?.name || ''}
        bg={
          examData.risk?.type
            ? `risk.${examData.risk.type.toLocaleLowerCase()}`
            : undefined
        }
        handleSelect={(option: any) =>
          option.id &&
          setExamData({
            ...examData,
            error: { ...examData.error, risk: false },
            risk: option,
            riskId: option.id,
          })
        }
        text={examData.risk?.name || 'selecione um risco'}
        multiple={false}
      />
      <ExamSelect
        asyncLoad
        sx={{ minWidth: '100%', mt: 5, overflow: 'hidden' }}
        large
        text={examData.exam?.name || 'selecione um exame'}
        active={!!examData.exam?.id}
        error={examData.error.exam}
        tooltipTitle={examData.exam?.name || ''}
        multiple={false}
        onlyExam
        handleSelect={(option: any) =>
          option?.id &&
          setExamData({
            ...examData,
            error: { ...examData.error, exam: false },
            exam: option,
            examId: option.id,
          })
        }
      />
      <SText color="text.label" fontSize={14} mb={3} mt={5}>
        Grau de risco mínimo
      </SText>
      <SFlex gap={5} mt={2} maxWidth={400} flexWrap="wrap">
        <Box flex={1} width={200}>
          <SelectForm
            defaultValue={String(examData.minRiskDegree || 1)}
            label="Qualitativo"
            control={control}
            placeholder="grau de risco..."
            name="minRiskDegree"
            labelPosition="center"
            size="small"
            options={Object.values(matrixRiskMap)
              .filter((m) => m.level > 0 && m.level < 6)
              .map((value) => ({
                value: value.level,
                content: value.label,
              }))}
          />
        </Box>
        <Box flex={1} maxWidth={200}>
          {isQuantity(examData.risk) && (
            <SelectForm
              fullWidth
              defaultValue={String(examData.minRiskDegreeQuantity || 1)}
              label="Quantitativo"
              control={control}
              placeholder="grau de risco..."
              name="minRiskDegreeQuantity"
              labelPosition="center"
              size="small"
              options={Object.values(matrixRiskMap)
                .filter((m) => m.level > 0 && m.level < 6)
                .map((value) => ({
                  value: value.level,
                  content: value.label,
                }))}
            />
          )}
        </Box>
      </SFlex>
    </SFlex>
  );
};
