/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { InputHTMLAttributes } from 'react';
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

const MEDS_SUGGESTION_TOOLTIP =
  'Sugestão do sistema com base nas medidas de prevenção atualmente cadastradas. A seleção manual do usuário será preservada.';

export const RadioInput = ({
  control,
  setValue,
  name,
  data,
  defaultValue,
  suggestedValue,
}: IUseProbability & {
  name: string;
  data: IProbabilityQuestion;
  defaultValue: string;
  suggestedValue?: number | null;
}) => {
  const selected = useWatch({ control, name });
  const selectedNumber =
    selected === '' || selected == null || Number.isNaN(Number(selected))
      ? null
      : Number(selected);
  const diverges =
    suggestedValue != null &&
    selectedNumber != null &&
    selectedNumber !== suggestedValue;
  const options = (
    (data.data as unknown as
      | Array<{ value: number; name: string }>
      | undefined) ?? []
  ).map((option) =>
    diverges && Number(option.value) === suggestedValue
      ? { ...option, tooltip: MEDS_SUGGESTION_TOOLTIP }
      : option,
  );

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
        inputPropsFunc={(option) =>
          diverges && Number(option?.value) === suggestedValue
            ? ({
                'data-suggested': 'true',
              } as InputHTMLAttributes<HTMLInputElement>)
            : {}
        }
        options={options}
        name={name}
        columns={5}
        reset={() => setValue(name, '')}
        {...(suggestedValue !== undefined
          ? {
              sx: {
                '& input[data-suggested="true"]:not(:checked) + span': {
                  borderColor: 'info.main',
                  boxShadow: (theme) =>
                    `inset 0 0 0 1px ${theme.palette.info.main}`,
                },
              },
            }
          : {})}
      />
    </div>
  );
};

export const ProbabilityForm = (props: IUseProbability) => {
  const { control, probabilityData, setValue, loading } = props;
  const watched = useWatch({ control });
  const preview = qualitativeProbabilityPreview(
    criteriaFromForm(watched ?? {}),
  );
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
        {props.journeyStatus === 'CONFLITANTE' ? (
          <SFlex direction="column" gap={1} mt={2} mb={2}>
            <SText fontSize={13} fontWeight={600} color="error.main">
              Jornadas diferentes identificadas
            </SText>
            <SText fontSize={12} color="text.label">
              Existem trabalhadores abrangidos por esta ocorrência com durações
              de jornada distintas. Revise os turnos/jornadas cadastrados ou
              segregue os trabalhadores em grupos/elementos distintos quando as
              jornadas forem realmente diferentes.
            </SText>
            <SText fontSize={12} color="text.secondary">
              Preencher este campo manualmente não corrige o cadastro.
            </SText>
            {props.journeyOptions.map((option) => (
              <SText
                key={option.durationMinutes}
                fontSize={12}
                color="text.secondary"
              >
                {`${option.shiftNames.join(', ') || 'Turno'} — ${option.durationMinutes} min (${option.employeeCount} trabalhador${option.employeeCount === 1 ? '' : 'es'})`}
              </SText>
            ))}
          </SFlex>
        ) : null}
        <SFlex
          sx={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr 1fr',
            '*': { fontSize: '14px !important' },
            mt: 5,
          }}
        >
          <SFlex direction="column" gap={1}>
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
            {props.journeyStatus === 'CONSISTENTE_INCOMPLETO' ? (
              <SText
                fontSize={12}
                color="common.black"
                sx={{
                  lineHeight: 1.4,
                  bgcolor: '#FFF8E1',
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                }}
              >
                <strong>Atenção:</strong>
                {` jornada identificada para apenas ${props.knownJourneyCount} de ${props.coveredEmployeeCount} trabalhadores abrangidos. Verifique os trabalhadores sem jornada definida. Diferenças de jornada dentro do mesmo grupo também podem indicar que o grupo precisa ser revisto quanto à homogeneidade da exposição.`}
              </SText>
            ) : null}
          </SFlex>
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
        suggestedValue={props.suggestedMedsImplemented}
        data={probabilityQuestionsMap[ProbabilityQuestionEnum.MEASURE] as any}
      />
    </SFlex>
  );
};
