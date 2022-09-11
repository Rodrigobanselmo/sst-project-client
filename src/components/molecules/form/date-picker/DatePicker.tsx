/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';

import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';

import { dateMask } from 'core/utils/masks/date.mask';

import { UnmountBox } from '../unmount-box';
import { InputDateFormProps } from './types';

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
  unmountOnChangeDefault,
  boxProps,
  setValue,
  ...restInput
}: InputDateFormProps) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    defaultValue !== undefined && setValue?.(name, defaultValue as any);
  }, [defaultValue, name, setValue]);

  return (
    <UnmountBox
      unmountOnChangeDefault={!isFocused && unmountOnChangeDefault}
      defaultValue={defaultValue}
      {...boxProps}
    >
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
            onFocus={() => setIsFocused(true)}
            onChange={(date, e) => {
              func(date, e);
              onChange && onChange(date);
            }}
            inputProps={{
              onBlur: () => {
                onBlur();
                setIsFocused(false);
              },
              helperText: error?.message ?? null,
              error: !!error,
              ...rest,
              ...restInput,
              onFocus: () => setIsFocused(true),
            }}
            onChangeRaw={(e) => {
              if (typeof e.target.value === 'string') {
                mask && mask(e);
              }
            }}
            {...calendarProps}
          />
        )}
      />
    </UnmountBox>
  );
};
