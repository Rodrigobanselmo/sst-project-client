import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  SDatePicker,
  SDatePickerProps,
} from '../../fields/SDatePicker/SDatePicker';
import { SSelect, SSelectProps } from '../../fields/SSelect/SSelect';
import { getNestedError } from '../get-nested-error';

interface SSelectFormProps<T>
  extends Omit<SSelectProps<T>, 'onChange' | 'value'> {
  name: string;
}

//! tem que ver pq não ta funcionando
export function SSelectForm<T>({ name, ...props }: SSelectFormProps<T>) {
  const { setValue, formState, control, clearErrors } = useFormContext();

  const error = getNestedError(formState?.errors, name);

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SSelect
      {...props}
      errorMessage={errorMessage}
      value={value}
      onChange={(value) => {
        setValue(name, value);
        // Clear error when user makes a selection
        if (formState.errors[name]) {
          clearErrors(name);
        }
      }}
    />
  );
}
