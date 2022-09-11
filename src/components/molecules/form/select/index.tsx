import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';

import SSelect from 'components/atoms/SSelect';

import { UnmountBox } from '../unmount-box';
import { SelectFormProps } from './types';

export const SelectForm = ({
  defaultValue = '',
  name,
  control,
  label = '',
  variant = 'outlined',
  onChange,
  options,
  unmountOnChangeDefault,
  boxProps,
  setValue,
  ...restSelect
}: SelectFormProps) => {
  useEffect(() => {
    (defaultValue || unmountOnChangeDefault) && setValue?.(name, defaultValue);
  }, [defaultValue, unmountOnChangeDefault, name, setValue]);

  return (
    <UnmountBox
      unmountOnChangeDefault={unmountOnChangeDefault}
      defaultValue={defaultValue}
      {...boxProps}
    >
      <Controller
        name={name}
        defaultValue={defaultValue}
        control={control}
        render={({
          field: { onChange: func, ref, value, ...rest },
          fieldState: { error },
        }) => (
          <SSelect
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
    </UnmountBox>
  );
};
