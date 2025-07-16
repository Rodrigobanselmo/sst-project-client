import { SSelectForm } from '@v2/components/forms/controlled/SSelectForm/SSelectForm';

interface ScaleFormProps {
  sectionIndex: number;
  questionIndex: number;
}

export const ScaleForm = ({ sectionIndex, questionIndex }: ScaleFormProps) => {
  return (
    <SSelectForm
      name={`sections.${sectionIndex}.items.${questionIndex}.scale`}
      label="Escala"
      options={[
        { label: '1-5', value: '1-5' },
        { label: '1-10', value: '1-10' },
        { label: '0-100', value: '0-100' },
      ]}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
    />
  );
};
