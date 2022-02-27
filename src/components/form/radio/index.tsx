import React from 'react';
import { Controller } from 'react-hook-form';

import SRadioCheckbox from 'components/atoms/SRadioCheckbox';

import { InputFormProps } from './types';

export const RadioForm = ({
  defaultValue,
  name,
  control,
  onChange,
  ...restInput
}: InputFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        field: { onChange: func, value, ...rest },
        fieldState: { error },
      }) => {
        return (
          <SRadioCheckbox
            name={name}
            helperText={error?.message ?? undefined}
            defaultValue={defaultValue}
            error={!!error}
            inputProps={() => ({
              onChange: (e) => {
                onChange && onChange(e);
                func(e);
              },
              ...rest,
            })}
            {...restInput}
          />
        );
      }}
    />
  );
};
