import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  SDatePicker,
  SDatePickerProps,
} from '../../fields/SDatePicker/SDatePicker';

interface SDatePickerFormProps
  extends Omit<SDatePickerProps, 'onChange' | 'value'> {
  name: string;
}

export function SDatePickerForm({ name, ...props }: SDatePickerFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SDatePicker
      {...props}
      errorMessage={errorMessage}
      value={value}
      onChange={(date) => setValue(name, date)}
    />
  );
}
