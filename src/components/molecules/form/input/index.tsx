import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';

import { SInput } from '../../../atoms/SInput';
import { InputFormProps } from './types';

export const InputForm = ({
  defaultValue = '',
  mask,
  name,
  control,
  label = '',
  variant = 'outlined',
  onChange,
  uneditable,
  setValue,
  ...restInput
}: InputFormProps) => {
  useEffect(() => {
    defaultValue && setValue?.(name, defaultValue);
  }, [defaultValue, name, setValue]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || ''}
      render={({
        field: { onBlur, onChange: func, ref, value: _value, ...rest },
        fieldState: { error },
      }) => (
        <SInput
          helperText={error?.message ?? null}
          error={!!error}
          onChange={(e) => {
            mask && mask(e);
            onChange && onChange(e);
            func(e);
          }}
          onBlur={onBlur}
          inputRef={ref}
          fullWidth
          label={label}
          variant={variant}
          value={uneditable ? defaultValue : (_value ?? '')}
          disabled={uneditable}
          {...rest}
          {...restInput}
        />
      )}
    />
  );
};
