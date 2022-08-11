import React, { useEffect } from 'react';
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
  mask,
  setValue,
  inputProps = {},
  freeSolo,
  onGetValue,
  ...restSelect
}: AutocompleteFormProps<T>) {
  useEffect(() => {
    if (freeSolo && defaultValue) {
      setValue?.(String(defaultValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          freeSolo={freeSolo}
          ListboxProps={{ sx: { fontSize: '14px' } } as any}
          defaultValue={defaultValue}
          options={options}
          onChange={(e, v) => {
            onChange && onChange(v);
            if (freeSolo && v) {
              setTimeout(() => {
                if (onGetValue) {
                  func(onGetValue(v));
                } else func(String(v));
              }, 100);
            }
          }}
          fullWidth
          label={label}
          {...rest}
          {...restSelect}
          {...(freeSolo && {
            inputValue: value || '',
            onInputChange: (e) => {
              if (e) {
                mask?.(e as any);
                func(e);
              }
            },
          })}
        />
      )}
    />
  );
}
