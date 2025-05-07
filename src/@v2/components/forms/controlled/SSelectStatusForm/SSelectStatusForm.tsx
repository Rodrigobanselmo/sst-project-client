import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  SSelectStatus,
  SSelectStatusProps,
} from '../../fields/SSelectStatus/SSelectStatus';
import { IPopperStatusValue } from '@v2/components/organisms/SPopper/addons/SPopperStatus/SPopperStatus';

interface SSelectFormProps
  extends Omit<SSelectStatusProps, 'onChange' | 'value'> {
  name: string;
}

export function SSelectStatusForm({ name, ...props }: SSelectFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control }) as IPopperStatusValue;

  return (
    <SSelectStatus
      {...props}
      errorMessage={errorMessage}
      value={value}
      onChange={(_, value) => setValue(name, value)}
    />
  );
}
