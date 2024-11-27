import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  SDatePicker,
  SDatePickerProps,
} from '../../fields/SDatePicker/SDatePicker';
import { SSelect, SSelectProps } from '../../fields/SSelect/SSelect';

interface SSelectFormProps<T>
  extends Omit<SSelectProps<T>, 'onChange' | 'value'> {
  name: string;
}

//! tem que ver pq não ta funcionando
export function SSelectForm<T>({ name, ...props }: SSelectFormProps<T>) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SSelect
      {...props}
      errorMessage={errorMessage}
      value={value}
      onChange={(value) => setValue(name, value)}
    />
  );
}
