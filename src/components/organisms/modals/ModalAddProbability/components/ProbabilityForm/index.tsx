/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useWatch } from 'react-hook-form';

import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';

import {
  IProbabilityQuestion,
  ProbabilityQuestionEnum,
  probabilityQuestionsMap,
} from 'core/constants/maps/probability/probability-questions.constant';

import { IUseProbability } from '../../hooks/useProbability';
import {
  criteriaFromForm,
  qualitativeProbabilityPreview,
} from '../../qualitative-probability.util';

export const RadioInput = ({
  control,
  setValue,
  name,
  data,
  defaultValue,
}: IUseProbability & {
  name: string;
  data: IProbabilityQuestion;
  defaultValue: string;
}) => {
  return (
    <div>
      <SText color="text.light" fontSize={14}>
        {data.title}
      </SText>
      <SText mb={4} color="text.label" fontSize={12}>
        {data.text}
      </SText>
      <RadioFormText
        setValue={setValue}
        type="radio"
        control={control}
        defaultValue={defaultValue}
        inputProps={{
          optionsFieldName: { contentField: 'name' },
          itemProps: { sx: { fontSize: 12 } },
        }}
        options={data.data as any}
        name={name}
        columns={5}
        reset={() => setValue(name, '')}
      />
    </div>
  );
};

export const ProbabilityForm = (props: IUseProbability) => {
  const { control, probabilityData, setValue, loading } = props;
  const watched = useWatch({ control });
  const preview = qualitativeProbabilityPreview(criteriaFromForm(watched ?? {}));
  const criteriaLabel = !preview
    ? ''
    : preview.criteriaCount === 1
      ? 'Calculada com 1 critério informado.'
      : `Calculada com ${preview.criteriaCount} critérios informados.`;

  return (
    <SFlex gap={19} direction="column" mt={8}>
      <SFlex
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 3,
          px: 5,
          py: 4,
          borderRadius: 1,
          bgcolor: 'primary.main',
        }}
      >
        <SFlex direction="column" sx={{ flex: '1 1 auto', minWidth: 0 }}>
          {preview ? (
            <>
              <SText color="text.dark" fontSize={16} fontWeight={600}>
                {`Probabilidade estimada: P${preview.probability}`}
              </SText>
              <SText color="text.dark" fontSize={13}>
                {criteriaLabel}
              </SText>
            </>
          ) : (
            <SText color="text.dark" fontSize={14}>
              Preencha os critérios para visualizar a probabilidade estimada.
            </SText>
          )}
        </SFlex>
        <SButton
          type="submit"
          variant="outlined"
          color="inherit"
          loading={loading}
          sx={{
            alignSelf: { xs: 'flex-end', sm: 'center' },
            flexShrink: 0,
            color: 'common.black',
            borderColor: 'common.black',
            bgcolor: 'transparent',
            '&:hover': {
              color: 'common.black',
              borderColor: 'common.black',
              bgcolor: 'action.hover',
            },
            '&.Mui-focusVisible': {
              color: 'common.black',
              borderColor: 'common.black',
            },
          }}
        >
          Aplicar
        </SButton>
      </SFlex>
      <div>
        <SText color="text.light" fontSize={14}>
          {probabilityQuestionsMap[ProbabilityQuestionEnum.EMPLOYEES].title}
        </SText>
        <SText mb={4} color="text.label" fontSize={12}>
          {probabilityQuestionsMap[ProbabilityQuestionEnum.EMPLOYEES].text}
        </SText>
        <SFlex
          sx={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr 1fr',
            '*': { fontSize: '14px !important' },
            mt: 5,
          }}
        >
          <InputForm
            sx={{ legend: { width: '250px' } }}
            setValue={setValue}
            defaultValue={String(probabilityData.employeeCountTotal)}
            label="Número de funcionários do estabelecimento"
            labelPosition="center"
            control={control}
            placeholder={'quantidade total de funcionários...'}
            name="employeeCountTotal"
            size="small"
          />
          <InputForm
            setValue={setValue}
            sx={{ legend: { width: '180px' } }}
            defaultValue={String(probabilityData.employeeCountGho)}
            label="Número de funcionários do GSE"
            labelPosition="center"
            control={control}
            placeholder={'quantidade de funcionários do GSE...'}
            name="employeeCountGho"
            size="small"
          />
        </SFlex>
      </div>

      <div>
        <SText color="text.light" fontSize={14}>
          {probabilityQuestionsMap[ProbabilityQuestionEnum.DURATION].title}
        </SText>
        <SText mb={4} color="text.label" fontSize={12}>
          {probabilityQuestionsMap[ProbabilityQuestionEnum.DURATION].text}
        </SText>
        <SFlex
          sx={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr 1fr',
            '*': { fontSize: '14px !important' },
            mt: 5,
          }}
        >
          <InputForm
            sx={{ legend: { width: '240px' } }}
            defaultValue={probabilityData.minDurationJT}
            label="Duração da jornada de trabalho (minutos)"
            labelPosition="center"
            control={control}
            setValue={setValue}
            placeholder={'nome do estabelecimento de trabalho...'}
            name="minDurationJT"
            autoComplete="off"
            size="small"
          />
          <InputForm
            sx={{ legend: { width: '250px' } }}
            defaultValue={probabilityData.minDurationEO}
            label="Duração da exposição ocupacional (minutos)"
            labelPosition="center"
            setValue={setValue}
            control={control}
            autoComplete="off"
            placeholder={'nome do estabelecimento de trabalho...'}
            name="minDurationEO"
            size="small"
          />
        </SFlex>
      </div>

      <RadioInput
        {...props}
        defaultValue={String(probabilityData.chancesOfHappening)}
        name={'chancesOfHappening'}
        data={probabilityQuestionsMap[ProbabilityQuestionEnum.CHANCE] as any}
      />
      <RadioInput
        {...props}
        defaultValue={String(probabilityData.frequency)}
        name={'frequency'}
        data={probabilityQuestionsMap[ProbabilityQuestionEnum.FREQUENCY] as any}
      />
      <RadioInput
        {...props}
        defaultValue={String(probabilityData.history)}
        name={'history'}
        data={probabilityQuestionsMap[ProbabilityQuestionEnum.HISTORY] as any}
      />
      <RadioInput
        {...props}
        defaultValue={String(probabilityData.medsImplemented)}
        name={'medsImplemented'}
        data={probabilityQuestionsMap[ProbabilityQuestionEnum.MEASURE] as any}
      />
    </SFlex>
  );
};
