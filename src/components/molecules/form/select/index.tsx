import React from 'react';
import { Controller } from 'react-hook-form';

import SSelect from 'components/atoms/SSelect';

import { SelectFormProps } from './types';

export const SelectForm = ({
  defaultValue = '',
  name,
  control,
  label = '',
  variant = 'outlined',
  onChange,
  options,
  ...restSelect
}: SelectFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange: func, ref, value, ...rest },
        fieldState: { error },
      }) => (
        <SSelect
          defaultValue={defaultValue}
          helperText={error?.message ?? null}
          options={options}
          error={!!error}
          onChange={(e) => {
            onChange && onChange(e);
            func(e);
          }}
          inputRef={ref}
          fullWidth
          label={label}
          variant={variant}
          value={value || ''}
          {...rest}
          {...restSelect}
        />
      )}
    />
  );
};
