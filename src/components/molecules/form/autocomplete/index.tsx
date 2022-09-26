import React, { useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';

import AutocompleteSelect from 'components/atoms/SAutocompleteSelect';

import { UnmountBox } from '../unmount-box';
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
  onInputChange,
  unmountOnChangeDefault,
  boxProps,
  ...restSelect
}: AutocompleteFormProps<T>) {
  const ref = useRef<any>(null);
  useEffect(() => {
    if (
      defaultValue !== undefined &&
      defaultValue !== null &&
      ref.current != defaultValue
    ) {
      setValue?.(String(defaultValue));
      ref.current = defaultValue;
    }
  }, [freeSolo, defaultValue, setValue]);

  return (
    <UnmountBox
      unmountOnChangeDefault={unmountOnChangeDefault}
      defaultValue={defaultValue}
      {...boxProps}
    >
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
            onInputChange={onInputChange}
            {...rest}
            {...restSelect}
            {...(freeSolo && {
              inputValue: value || '',
              onInputChange: (e, v, w) => {
                if (e) {
                  mask?.(e as any);
                  func(e);
                  onInputChange?.(e, v, w);
                }
              },
            })}
          />
        )}
      />
    </UnmountBox>
  );
}
