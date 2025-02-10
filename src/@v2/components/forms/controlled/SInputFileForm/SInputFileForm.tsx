import { SIconError } from '@v2/assets/icons/SIconError/SIconError';
import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import { SInputFile } from '../../fields/SInputFile/SInputFile';
import { SInputFileProps } from '../../fields/SInputFile/SInputFile.types';

interface SInputFileFormProps
  extends Omit<SInputFileProps, 'onChange' | 'value'> {
  name: string;
}

export function SInputFileForm({ name, ...props }: SInputFileFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SInputFile
      {...props}
      helperText={errorMessage}
      error={!!error}
      value={value}
      onChange={(file) => setValue(name, file)}
    />
  );
}
