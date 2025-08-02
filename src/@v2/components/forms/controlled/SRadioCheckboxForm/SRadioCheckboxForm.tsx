import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import { SRadioCheckbox } from '../../fields/SRadioCheckbox/SRadioCheckbox';
import { SRadioCheckboxProps } from '../../fields/SRadioCheckbox/SRadioCheckbox.types';
import { getNestedError } from '../get-nested-error';

interface SRadioCheckboxFormProps<T = any>
  extends Omit<SRadioCheckboxProps<T>, 'onChange' | 'value'> {
  name: string;
}

export function SRadioCheckboxForm<T>({
  name,
  ...props
}: SRadioCheckboxFormProps<T>) {
  const { setValue, formState, control } = useFormContext();

  const error = getNestedError(formState?.errors, name);

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SRadioCheckbox
      {...props}
      value={value || []}
      onChange={(selectedOptions) => setValue(name, selectedOptions)}
      error={!!error}
      errorMessage={errorMessage}
    />
  );
}
