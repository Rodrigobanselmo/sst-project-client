import { useFormContext, useWatch } from 'react-hook-form';
import {
  SSearchSelect,
  SSearchSelectProps,
} from '../../fields/SSearchSelect/SSearchSelect';
import {
  SSearchSelectMultiple,
  SSearchSelectMultipleProps,
} from '../../fields/SSearchSelect/SSearchSelectMultiple';
import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { getNestedError } from '../get-nested-error';

interface SSearchSelectFormProps<T>
  extends Omit<SSearchSelectProps<T>, 'onChange' | 'value' | 'component'> {
  component?: (args: { option?: T }) => React.ReactNode;
  name: string;
  getReturnValue?: (value: T) => string;
}

export function SSearchSelectForm<T>({
  name,
  component,
  ...inputProps
}: SSearchSelectFormProps<T>) {
  const { setValue, formState, control } = useFormContext();

  const error = getNestedError(formState?.errors, name);

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SSearchSelect
      {...inputProps}
      value={value}
      onChange={(value, e) => setValue(name, value)}
      errorMessage={errorMessage}
      component={component ? () => component({ option: value }) : undefined}
    />
  );
}

interface SSearchSelectMultipleFormProps<T>
  extends Omit<SSearchSelectMultipleProps<T>, 'onChange' | 'value'> {
  name: string;
}

export function SSearchSelectMultipleForm<T>({
  name,
  ...inputProps
}: SSearchSelectMultipleFormProps<T>) {
  const { setValue, formState, control } = useFormContext();

  const error = getNestedError(formState?.errors, name);

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch<{ [key: string]: T[] }>({ name, control });

  return (
    <SSearchSelectMultiple
      {...inputProps}
      value={value || []}
      onChange={(value, e) => setValue(name, value)}
      errorMessage={errorMessage}
    />
  );
}
