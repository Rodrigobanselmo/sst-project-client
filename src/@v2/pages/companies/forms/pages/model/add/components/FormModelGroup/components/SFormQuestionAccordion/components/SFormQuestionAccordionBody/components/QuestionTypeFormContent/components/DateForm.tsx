import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';

interface DateFormProps {
  sectionIndex: number;
  questionIndex: number;
}

export const DateForm = ({ sectionIndex, questionIndex }: DateFormProps) => {
  return (
    <SDatePickerForm
      name={`sections.${sectionIndex}.items.${questionIndex}.defaultValue`}
      label="Data padrão (opcional)"
    />
  );
};
