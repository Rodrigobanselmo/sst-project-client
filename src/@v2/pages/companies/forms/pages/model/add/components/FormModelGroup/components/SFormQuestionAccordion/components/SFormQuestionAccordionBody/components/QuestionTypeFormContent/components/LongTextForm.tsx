import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';

interface LongTextFormProps {
  sectionIndex: number;
  questionIndex: number;
}

export const LongTextForm = ({
  sectionIndex,
  questionIndex,
}: LongTextFormProps) => {
  return (
    <SInputMultilineForm
      name={`sections.${sectionIndex}.items.${questionIndex}.placeholder`}
      label="Texto de resposta longa"
      variant="standard"
      disabled
      color="info"
      placeholder="Digite a resposta..."
      inputProps={{ minRows: 2, maxRows: 6 }}
    />
  );
};
