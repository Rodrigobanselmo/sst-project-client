import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';

interface DateFormProps {
  sectionIndex: number;
  questionIndex: number;
}

export const DateForm = ({ sectionIndex, questionIndex }: DateFormProps) => {
  return (
    <div style={{ maxWidth: '200px' }}>
      <SDatePickerForm
        name={`sections.${sectionIndex}.items.${questionIndex}.defaultValue`}
        label=""
        disabled={true}
        textFieldProps={{
          placeholder: 'dd/mm/aaaa',
          variant: 'standard',
          size: 'medium',
        }}
      />
    </div>
  );
};
