import React from 'react';
import { Controller } from 'react-hook-form';

import AutocompleteSelect from 'components/atoms/SAutocompleteSelect';

import { AutocompleteFormProps } from './types';

export function AutocompleteForm<T>({
  defaultValue = '',
  name,
  control,
  label = '',
  onChange,
  options,
  inputProps = {},
  ...restSelect
}: AutocompleteFormProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        field: { onChange: func, value, ...rest },
        fieldState: { error },
      }) => (
        <AutocompleteSelect
          inputProps={{
            error: !!error?.message,
            helperText: error?.message ?? null,
            ...rest,
            ...inputProps,
          }}
          ListboxProps={{ sx: { fontSize: '14px' } } as any}
          defaultValue={defaultValue}
          options={options}
          onChange={(e, v) => {
            onChange && onChange(v);
            // func(e);
          }}
          fullWidth
          label={label}
          // value={value || ''}
          {...rest}
          {...restSelect}
        />
      )}
    />
  );
}
