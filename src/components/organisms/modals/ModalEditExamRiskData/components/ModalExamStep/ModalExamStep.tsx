/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { ExamIncompatibilityAlert } from 'components/organisms/tagSelects/ExamSelect/ExamIncompatibilityAlert';

import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { isQuantity } from 'core/utils/helpers/isQuantity';
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
      <ExamIncompatibilityAlert
        exam={examData}
        riskType={examData.riskType}
        sx={{ mb: 4 }}
      />

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

      <SText color="text.label" fontSize={14} mb={-2} mt={5}>
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

      <SText color="text.label" fontSize={14} mb={3} mt={5}>
        Faixa etária
      </SText>
      <SFlex minWidth={['100%', 600, 800]} flexWrap="wrap" gap={5}>
        <Box flex={1} maxWidth={150}>
          <InputForm
            defaultValue={String(examData.examRiskData.fromAge || '')}
            label="De"
            setValue={setValue}
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
            setValue={setValue}
            label="Até"
            labelPosition="center"
            control={control}
            endAdornment="anos"
            name="toAge"
            size="small"
          />
        </Box>
      </SFlex>

      <SFlex gap={5} mt={10} align="center" flexWrap="wrap">
        <Box flex={1}>
          <AutocompleteForm
            name="validityInMonths"
            control={control}
            filterOptions={(x) => x}
            freeSolo
            getOptionLabel={(option) => `${option} meses`}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'meses...',
              name: 'validityInMonths',
            }}
            setValue={(v) => setValue('validityInMonths', String(v))}
            defaultValue={examData.examRiskData.validityInMonths || ''}
            mask={intMask.apply}
            label="Peridiocidade (meses)"
            options={[3, 6, 9, 12, 18, 24]}
          />
        </Box>
        <Box flex={2}>
          {/* <AutocompleteForm
            name="lowValidityInMonths"
            filterOptions={(x) => x}
            control={control}
            freeSolo
            getOptionLabel={(option) => `${option} meses`}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'meses...',
              name: 'lowValidityInMonths',
            }}
            setValue={(v) => setValue('lowValidityInMonths', String(v))}
            defaultValue={examData.examRiskData.lowValidityInMonths || ''}
            mask={intMask.apply}
            label="Peridiocidade para comorbidades (meses)"
            options={[3, 6, 9, 12, 18, 24]}
          /> */}
        </Box>
      </SFlex>
      <AutocompleteForm
        name="considerBetweenDays"
        filterOptions={(x) => x}
        control={control}
        freeSolo
        getOptionLabel={(option) => `${option} dias`}
        inputProps={{
          labelPosition: 'top',
          placeholder: 'dias...',
          name: 'considerBetweenDays',
          helpText:
            'Exemplo (considerando valor de 60 dias entre ocupacional): caso seja necessaria realizar o exame periódico, o sistema irá verificar se o exame coplementar está com validade superior a 60 dias, se sim, não será solicitado a realização do exame. No caso da validade ser inferior a 60 dias, um novo exame será solicitado',
        }}
        setValue={(v) => setValue('considerBetweenDays', String(v))}
        defaultValue={examData.examRiskData.considerBetweenDays || ''}
        mask={intMask.apply}
        label="Considerar (dias entre ocupacional)"
        sx={{ width: [300], mt: 10 }}
        options={[30, 60, 90, 120, 180, 240, 300]}
      />

      <SText color="text.label" fontSize={14} mb={3} mt={5}>
        Grau de risco mínimo
      </SText>
      <SFlex gap={5} mt={2} maxWidth={400} flexWrap="wrap">
        <Box flex={1} width={200}>
          <SelectForm
            defaultValue={String(examData.examRiskData.minRiskDegree ?? 1)}
            label="Qualitativo"
            control={control}
            placeholder="grau de risco..."
            name="minRiskDegree"
            setValue={setValue}
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
        {isQuantity(examData.risk) && (
          <Box flex={1} maxWidth={200}>
            <SelectForm
              fullWidth
              defaultValue={String(
                examData.examRiskData.minRiskDegreeQuantity ?? 1,
              )}
              label="Quantitativo"
              control={control}
              setValue={setValue}
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
          </Box>
        )}
      </SFlex>
    </SFlex>
  );
};
