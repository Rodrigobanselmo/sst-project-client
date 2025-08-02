import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import { SRadio } from '../../fields/SRadio/SRadio';
import { SRadioProps } from '../../fields/SRadio/SRadio.types';
import { getNestedError } from '../get-nested-error';

interface SRadioFormProps<T = any>
  extends Omit<SRadioProps<T>, 'onChange' | 'value'> {
  name: string;
}

export function SRadioForm<T>({ name, ...props }: SRadioFormProps<T>) {
  const { setValue, formState, control } = useFormContext();

  const error = getNestedError(formState?.errors, name);

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SRadio
      {...props}
      value={value}
      onChange={(selectedOption) => setValue(name, selectedOption)}
      error={!!error}
      errorMessage={errorMessage}
    />
  );
}
