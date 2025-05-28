import { useFormContext, useWatch } from 'react-hook-form';

import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import {
  InputWorkspaceSelectMultiple,
  InputWorkspaceSelectMultipleProps,
} from './InputWorkspaceSelectMultiple';

interface InputWorkspaceSelectMultipleFormProps
  extends Omit<InputWorkspaceSelectMultipleProps, 'onChange' | 'value'> {
  name: string;
}

export function InputWorkspaceSelectMultipleForm({
  name,
  ...inputProps
}: InputWorkspaceSelectMultipleFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <InputWorkspaceSelectMultiple
      {...inputProps}
      value={value}
      onChange={(value) => setValue(name, value)}
      errorMessage={errorMessage}
    />
  );
}
