/* eslint-disable react/display-name */
import React from 'react';
import { Controller } from 'react-hook-form';

import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';

import { dateMask } from 'core/utils/masks/date.mask';

import { InputFormProps } from './types';

export const DatePickerForm = ({
  name,
  control,
  label = '',
  onChange,
  uneditable,
  placeholderText,
  inputFormat = 'dd/MM/yyyy',
  mask = dateMask.apply,
  defaultValue,
  calendarProps = {},
  ...restInput
}: InputFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      {...(defaultValue && defaultValue != 'Invalid Date'
        ? { defaultValue }
        : {})}
      render={({
        field: { onBlur, onChange: func, value, ...rest },
        fieldState: { error },
      }) => (
        <SDatePicker
          selected={value}
          uneditable={uneditable}
          placeholderText={placeholderText}
          inputFormat={inputFormat}
          label={label}
          onChange={(date, e) => {
            func(date, e);
            onChange && onChange(date);
          }}
          inputProps={{
            onBlur: onBlur,
            helperText: error?.message ?? null,
            error: !!error,
            ...rest,
            ...restInput,
          }}
          onChangeRaw={(e) => {
            if (typeof e.target.value === 'string') {
              mask(e);
            }
          }}
          {...calendarProps}
        />
      )}
    />
  );
};
