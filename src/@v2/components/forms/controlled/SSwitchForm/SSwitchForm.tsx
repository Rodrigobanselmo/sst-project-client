import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { SSwitchProps } from 'components/atoms/SSwitch/types';
import { useFormContext, useWatch } from 'react-hook-form';
import { SSwitch } from '../../fields/SSwitch/SSwitch';

interface SSwitchFormProps extends Omit<SSwitchProps, 'onChange' | 'value'> {
  name: string;
}

export function SSwitchForm({ name, ...props }: SSwitchFormProps) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SSwitch
      {...props}
      formControlProps={{ sx: { mx: 1, mt: 2 } }}
      value={value}
      onChange={(e) => setValue(name, e.target.checked)}
      errorMessage={errorMessage}
    />
  );
}
