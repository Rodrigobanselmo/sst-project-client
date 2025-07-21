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
import { getNestedError } from '../get-nested-error';

interface SInputMultilineFormProps
  extends Omit<SInputMultilineProps, 'onChange' | 'value'> {
  name: string;
}

export function SInputMultilineForm({
  name,
  ...props
}: SInputMultilineFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = getNestedError(formState?.errors, name);

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SInputMultiline
      {...props}
      helperText={errorMessage}
      error={!!error}
      value={value}
      onChange={(e) => setValue(name, e.target.value)}
    />
  );
}
