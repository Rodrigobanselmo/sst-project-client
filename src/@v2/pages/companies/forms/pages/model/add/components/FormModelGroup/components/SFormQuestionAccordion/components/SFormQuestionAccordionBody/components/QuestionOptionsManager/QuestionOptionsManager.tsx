import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';

interface QuestionOptionsManagerProps {
  sectionIndex: number;
  questionIndex: number;
}

export const QuestionOptionsManager = ({
  sectionIndex,
  questionIndex,
}: QuestionOptionsManagerProps) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
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

  return (
    <SFlex flexDirection="column" gap={3}>
      <SFlex alignItems="center" justifyContent="space-between">
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#666' }}>
          Opções de resposta
        </span>
        <SButton
          variant="outlined"
          size="s"
          icon={<AddIcon />}
          text="Adicionar opção"
          onClick={handleAddOption}
        />
      </SFlex>

      {fields.map((field, index) => (
        <SFlex key={field.id} alignItems="center" gap={2}>
          <SInputForm
            name={`sections.${sectionIndex}.items.${questionIndex}.options.${index}.label`}
            placeholder={`Opção ${index + 1}`}
            sx={{ flex: 1 }}
          />
          <SInputForm
            name={`sections.${sectionIndex}.items.${questionIndex}.options.${index}.value`}
            placeholder={`Valor ${index + 1}`}
            sx={{ flex: 1 }}
          />
          <IconButton
            size="small"
            onClick={() => handleRemoveOption(index)}
            disabled={fields.length <= 1}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </SFlex>
      ))}
    </SFlex>
  );
};
