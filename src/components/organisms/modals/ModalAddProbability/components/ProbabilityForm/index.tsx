/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';

import {
  IProbabilityQuestion,
  ProbabilityQuestionEnum,
  probabilityQuestionsMap,
} from 'core/constants/maps/probability/probability-questions.constant';

import { IUseProbability } from '../../hooks/useProbability';

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
      <RadioForm
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
  const { control, probabilityData } = props;

  return (
    <SFlex gap={19} direction="column" mt={8}>
      {probabilityQuestionsMap[
        ProbabilityQuestionEnum.INTENSITY_RESULT
      ].acceptRiskTypesForSelect.includes(props.probabilityData.riskType) && (
        <div>
          <SText color="text.light" fontSize={14}>
            {
              probabilityQuestionsMap[ProbabilityQuestionEnum.INTENSITY_RESULT]
                .title
            }
          </SText>
          <SText mb={4} color="text.label" fontSize={12}>
            {
              probabilityQuestionsMap[ProbabilityQuestionEnum.INTENSITY_RESULT]
                .text
            }
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
              sx={{ legend: { width: '30px' } }}
              defaultValue={probabilityData.intensityLt}
              label="LEO"
              labelPosition="center"
              control={control}
              placeholder={'valor do limite...'}
              name="intensityLt"
              size="small"
            />
            <InputForm
              sx={{ legend: { width: '65px' } }}
              defaultValue={probabilityData.intensityResult}
              label="Resultado"
              labelPosition="center"
              control={control}
              placeholder={'valor do resultado obtido...'}
              name="intensityResult"
              size="small"
            />
          </SFlex>
        </div>
      )}
      {probabilityQuestionsMap[
        ProbabilityQuestionEnum.INTENSITY
      ].acceptRiskTypesForSelect.includes(props.probabilityData.riskType) && (
        <RadioInput
          {...props}
          name={'intensity'}
          defaultValue={String(probabilityData.intensity)}
          data={
            probabilityQuestionsMap[ProbabilityQuestionEnum.INTENSITY] as any
          }
        />
      )}
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
            defaultValue={String(probabilityData.employeeCountTotal)}
            label="Número de empregados do estabelecimento"
            labelPosition="center"
            control={control}
            placeholder={'quantidade total de empregados...'}
            name="employeeCountTotal"
            size="small"
          />
          <InputForm
            sx={{ legend: { width: '180px' } }}
            defaultValue={String(probabilityData.employeeCountGho)}
            label="Número de empregados do GSE"
            labelPosition="center"
            control={control}
            placeholder={'quantidade de empregados do GSE...'}
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
