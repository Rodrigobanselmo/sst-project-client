import { useFormContext, useWatch } from 'react-hook-form';

import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import {
  InputFormModelSelect,
  InputFormModelSelectProps,
} from './InputFormModelSelect';

interface InputFormModelSelectFormProps
  extends Omit<InputFormModelSelectProps, 'onChange' | 'value'> {
  name: string;
}

export function InputFormModelSelectForm({
  name,
  ...inputProps
}: InputFormModelSelectFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <InputFormModelSelect
      {...inputProps}
      value={value}
      onChange={(value) => setValue(name, value)}
      errorMessage={errorMessage}
    />
  );
}
