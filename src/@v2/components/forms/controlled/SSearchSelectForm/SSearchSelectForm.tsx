import { useFormContext } from 'react-hook-form';
import {
  SSearchSelect,
  SSearchSelectProps,
} from '../../fields/SSearchSelect/SSearchSelect';
import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';

interface SSearchSelectFormProps<T>
  extends Omit<SSearchSelectProps<T>, 'onChange' | 'value'> {
  name: string;
}

export function SSearchSelectForm<T>({
  name,
  ...inputProps
}: SSearchSelectFormProps<T>) {
  const { setValue, formState, watch } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = watch(name);

  return (
    <SSearchSelect
      {...inputProps}
      value={value}
      onChange={(value, e) => setValue(name, value)}
      errorMessage={errorMessage}
    />
  );
}
