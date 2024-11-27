import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { useFormContext, useWatch } from 'react-hook-form';
import { SAutocompleteFreeSolo } from '../../fields/SAutocompleteFreeSolo/SAutocompleteFreeSolo';
import { SAutocompleteFreeSoloProps } from '../../fields/SAutocompleteFreeSolo/SAutocompleteFreeSolo.types';

interface SAutocompleteFreeSoloFormProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends Omit<
    SAutocompleteFreeSoloProps<Value, Multiple, DisableClearable, FreeSolo>,
    'onChange' | 'value'
  > {
  name: string;
}

export function SAutocompleteFreeSoloForm<
  T,
  M extends boolean | undefined,
  D extends boolean | undefined,
  F extends boolean | undefined,
>({ name, ...props }: SAutocompleteFreeSoloFormProps<T, M, D, F>) {
  const { setValue, formState, control } = useFormContext();

  const error = formState?.errors[name];

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control });

  return (
    <SAutocompleteFreeSolo
      {...props}
      errorMessage={errorMessage}
      value={value}
      onChange={(date) => setValue(name, date)}
    />
  );
}
