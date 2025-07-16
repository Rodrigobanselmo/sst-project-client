import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { IAddFormModelFormsFields } from '../../../../../../../FormModelAddContent/FormModelAddContent.schema';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { SRadio } from 'components/molecules/form/radio';
import { RadioBox } from './components/QuestionOptionsManager';
import { useEffect } from 'react';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';

interface QuestionOptionsManagerProps {
  sectionIndex: number;
  questionIndex: number;
}

export const QuestionOptionsManager = ({
  sectionIndex,
  questionIndex,
}: QuestionOptionsManagerProps) => {
  const { control } = useFormContext<IAddFormModelFormsFields>();

  const formType = useWatch({
    control,
    name: 'type',
  });

  const questionType = useWatch({
    control,
    name: `sections.${sectionIndex}.items.${questionIndex}.type`,
  });

  const { fields, replace, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items.${questionIndex}.options`,
  });

  const handleAddOption = () => {
    append({ label: '', value: '' });
  };

  const handleRemoveOption = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  useEffect(() => {
    const selectedType = questionType?.value;

    console.log('questionType', questionType, fields);
    if (
      selectedType === FormQuestionTypeEnum.RADIO ||
      selectedType === FormQuestionTypeEnum.CHECKBOX
    ) {
      // Check if options array is empty or doesn't exist
      if (!fields || fields.length === 0) {
        // Add 4 empty options
        const emptyOptions = Array.from({ length: 4 }, () => ({
          label: '',
          value: '',
        }));
        replace(emptyOptions);
      }
    }
  }, [questionType, fields, replace]);

  const showValueForm = formType?.value !== FormTypeEnum.NORMAL;

  return (
    <SFlex flexDirection="column" gap={5}>
      <SFlex alignItems="center" justifyContent="space-between" mb={5}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#666' }}>
          Opções de resposta
        </span>
      </SFlex>

      {fields.map((field, index) => (
        <SFlex key={field.id} alignItems="center" gap={2}>
          <RadioBox />
          <SInputForm
            name={`sections.${sectionIndex}.items.${questionIndex}.options.${index}.label`}
            placeholder={`Opção ${index + 1}`}
            variant="standard"
            color="info"
            sx={{ flex: 1 }}
          />
          {showValueForm && (
            <SInputForm
              name={`sections.${sectionIndex}.items.${questionIndex}.options.${index}.value`}
              placeholder={`Valor ${index + 1}`}
              sx={{ flex: 1 }}
            />
          )}
          <IconButton
            size="small"
            onClick={() => handleRemoveOption(index)}
            disabled={fields.length <= 1}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </SFlex>
      ))}

      <SFlex alignItems="center" gap={2} mt={2}>
        <RadioBox />
        <Box
          onClick={handleAddOption}
          sx={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#666',
            cursor: 'pointer',
            '&:hover': {
              color: '#000',
            },
          }}
        >
          Adicionar opção
        </Box>
      </SFlex>
    </SFlex>
  );
};
