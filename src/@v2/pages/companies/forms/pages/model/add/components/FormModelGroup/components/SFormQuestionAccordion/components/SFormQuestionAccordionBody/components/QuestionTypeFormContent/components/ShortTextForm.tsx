import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';

interface ShortTextFormProps {
  sectionIndex: number;
  questionIndex: number;
}

export const ShortTextForm = ({
  sectionIndex,
  questionIndex,
}: ShortTextFormProps) => {
  return (
    <SInputForm
      name={`sections.${sectionIndex}.items.${questionIndex}.placeholder`}
      label="Texto de resposta curta"
      variant="standard"
      disabled
      placeholder="Digite a resposta..."
    />
  );
};
