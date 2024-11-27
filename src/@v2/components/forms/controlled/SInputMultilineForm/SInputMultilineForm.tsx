import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  SDatePicker,
  SDatePickerProps,
} from '../../fields/SDatePicker/SDatePicker';
import { SInputMultiline } from '../../fields/SInputMultiline/SInputMultiline';
import { SInputMultilineProps } from '../../fields/SInputMultiline/SInput.types';
import { SIconError } from '@v2/assets/icons/SIconError/SIconError';
import { useEffect, useState } from 'react';

interface SInputMultilineFormProps
  extends Omit<SInputMultilineProps, 'onChange' | 'value'> {
  name: string;
}

export function SInputMultilineForm({
  name,
  ...props
}: SInputMultilineFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SInputMultiline
      {...props}
      helperText={errorMessage}
      endAdornment={
        !!props.endAdornment || !!error ? (
          <>
            {props.endAdornment}
            {!!error && <SIconError color="error.main" fontSize={20} />}
          </>
        ) : undefined
      }
      error={!!error}
      value={value}
      onChange={(e) => setValue(name, e.target.value)}
    />
  );
}
