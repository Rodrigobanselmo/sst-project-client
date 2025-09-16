import { Delete as DeleteIcon } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SText } from '@v2/components/atoms/SText/SText';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { QuestionTypeIcon } from './components/QuestionTypeIcon';
import { useRef } from 'react';
import { IFormModelForms } from '@v2/pages/companies/forms/pages/model/schemas/form-model.schema';

export const questionsIndicatorMapOptions: Record<
  number,
  { label: string; color: string }
> = {
  5: { label: 'Muito Negativo', color: '#F44336' },
  4: { label: 'Negativo', color: '#d96c2f' },
  3: { label: 'Neutro', color: '#d9d10b' },
  2: { label: 'Positivo', color: '#8fa728' },
  1: { label: 'Muito Positivo', color: '#3cbe7d' },
  0: { label: 'Não contabilizar', color: '#eeeeee' },
};

export const questionsRiskValueMapOptions: Record<
  number,
  { label: string; color: string }
> = {
  5: { label: 'Muito Negativo', color: '#F44336' },
  4: { label: 'Negativo', color: '#d96c2f' },
  3: { label: 'Neutro', color: '#d9d10b' },
  2: { label: 'Positivo', color: '#8fa728' },
  1: { label: 'Muito Positivo', color: '#3cbe7d' },
  0: { label: 'Não contabilizar', color: '#eeeeee' },
};

const questionsIndicatorMapOptionsArray = [
  { value: 5, ...questionsIndicatorMapOptions[5] },
  { value: 4, ...questionsIndicatorMapOptions[4] },
  { value: 3, ...questionsIndicatorMapOptions[3] },
  { value: 2, ...questionsIndicatorMapOptions[2] },
  { value: 1, ...questionsIndicatorMapOptions[1] },
  { value: 0, ...questionsIndicatorMapOptions[0] },
];

const questionsRiskValueMapOptionsArray = [
  { value: 5, ...questionsRiskValueMapOptions[5] },
  { value: 4, ...questionsRiskValueMapOptions[4] },
  { value: 3, ...questionsRiskValueMapOptions[3] },
  { value: 2, ...questionsRiskValueMapOptions[2] },
  { value: 1, ...questionsRiskValueMapOptions[1] },
  { value: 0, ...questionsRiskValueMapOptions[0] },
];

interface QuestionOptionsManagerProps {
  sectionIndex: number;
  questionIndex: number;
  disableQuestionValue?: boolean;
}

export const QuestionOptionsManager = ({
  sectionIndex,
  questionIndex,
  disableQuestionValue = false,
}: QuestionOptionsManagerProps) => {
  const { control } = useFormContext<IFormModelForms>();
  const addOptionRef = useRef<HTMLDivElement>(null);

  const formType = useWatch({
    control,
    name: 'type',
  });

  const questionType = useWatch({
    control,
    name: `sections.${sectionIndex}.items.${questionIndex}.type`,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items.${questionIndex}.options`,
  });

  const handleAddOption = () => {
    append({ label: '' });
  };

  const handleRemoveOption = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const nextIndex = currentIndex + 1;

      // If there's a next input, focus on it
      if (nextIndex < fields.length) {
        const nextInput = document.querySelector(
          `input[id="sections.${sectionIndex}.items.${questionIndex}.options.${nextIndex}.label"]`,
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        // If it's the last input, focus on the "Adicionar opção" button
        addOptionRef.current?.focus();
      }
    }
  };

  const riskValueForm =
    formType?.value && formType?.value !== FormTypeEnum.NORMAL;

  return (
    <SFlex flexDirection="column" gap={5}>
      <SFlex alignItems="center" justifyContent="space-between" mb={5}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#666' }}>
          Opções de resposta
        </span>
      </SFlex>

      {fields.map((field, index) => (
        <SFlex key={field.id} alignItems="center" gap={2}>
          <QuestionTypeIcon type={questionType?.value} />
          <SInputForm
            name={`sections.${sectionIndex}.items.${questionIndex}.options.${index}.label`}
            id={`sections.${sectionIndex}.items.${questionIndex}.options.${index}.label`}
            placeholder={`Opção ${index + 1}`}
            variant="standard"
            color="info"
            sx={{ flex: 1 }}
            textFieldProps={{
              onKeyDown: (e) => handleKeyDown(e, index),
            }}
          />
          {!disableQuestionValue && (
            <SSearchSelectForm
              name={`sections.${sectionIndex}.items.${questionIndex}.options.${index}.value`}
              placeholder={`Valor ${index + 1}`}
              hideSearchInput={true}
              options={
                riskValueForm
                  ? questionsRiskValueMapOptionsArray
                  : questionsIndicatorMapOptionsArray
              }
              getOptionLabel={(option) => option.label}
              component={({ option }) => (
                <SFlex
                  alignItems="center"
                  justifyContent="center"
                  p={3}
                  sx={{
                    cursor: 'pointer',
                    mb: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    width: '150px',
                    borderColor: 'text.label',
                    mx: 5,
                    '&:hover': {
                      filter: 'brightness(0.8)',
                    },
                    backgroundColor: option?.color
                      ? option.color + '99'
                      : '#eeeeee99',
                  }}
                >
                  <SText>{option?.label || 'Não contabilizar'}</SText>
                </SFlex>
              )}
              getOptionValue={(option) => option.value}
              renderFullOption={({ option, label, handleSelect }) => (
                <SFlex
                  alignItems="center"
                  onClick={() => handleSelect(option)}
                  justifyContent="center"
                  p={3}
                  flex={1}
                  sx={{
                    cursor: 'pointer',
                    mb: 2,
                    borderRadius: 1,
                    mx: 5,
                    '&:hover': {
                      filter: 'brightness(0.8)',
                    },
                    backgroundColor: option.color + '99',
                  }}
                >
                  <SText>{label}</SText>
                </SFlex>
              )}
            />
          )}
          <IconButton
            size="small"
            onClick={() => handleRemoveOption(index)}
            disabled={fields.length <= 1}
            tabIndex={-1}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </SFlex>
      ))}

      <SFlex alignItems="center" gap={2} mt={2}>
        <QuestionTypeIcon type={questionType?.value} />
        <Box
          ref={addOptionRef}
          onClick={handleAddOption}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddOption();
            }
          }}
          tabIndex={0}
          sx={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#666',
            cursor: 'pointer',
            '&:hover': {
              color: '#000',
            },
            '&:focus': {
              outline: '2px solid #1976d2',
              outlineOffset: '2px',
            },
          }}
        >
          Adicionar opção
        </Box>
      </SFlex>
    </SFlex>
  );
};
