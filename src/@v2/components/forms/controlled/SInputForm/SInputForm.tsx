import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import { SInput } from '../../fields/SInput/SInput';
import { SInputMultilineProps } from '../../fields/SInputMultiline/SInput.types';

interface SInputFormProps
  extends Omit<SInputMultilineProps, 'onChange' | 'value'> {
  name: string;
}

export function SInputForm({ name, ...props }: SInputFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SInput
      {...props}
      helperText={errorMessage}
      error={!!error}
      value={value}
      onChange={(e) => setValue(name, e.target.value)}
    />
  );
}
