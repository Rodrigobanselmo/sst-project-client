/* eslint-disable react/display-name */
import React, { useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { Controller } from 'react-hook-form';

import pt from 'date-fns/locale/pt-BR';

import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import SDateIcon from 'assets/icons/SDateIcon';

import { dateMask, dateMonthMask } from 'core/utils/masks/date.mask';

import { SInput } from '../../../atoms/SInput';
import { InputFormProps } from './types';
registerLocale('pt', pt);

export const DatePickerForm = ({
  name,
  control,
  label = '',
  onChange,
  uneditable,
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
      defaultValue={defaultValue}
      render={({
        field: { onBlur, onChange: func, value, ...rest },
        fieldState: { error },
      }) => (
        <DatePicker
          locale="pt"
          selected={value}
          showPopperArrow={false}
          disabled={uneditable}
          dateFormat={inputFormat}
          onChange={(date, e) => {
            func(date, e);
            onChange && onChange(date);
          }}
          onChangeRaw={(e) => {
            if (typeof e.target.value === 'string') {
              mask(e);
            }
          }}
          customInput={
            <SInput
              label={label}
              labelPosition="center"
              size="small"
              fullWidth
              endAdornment={<SDateIcon />}
              onBlur={onBlur}
              helperText={error?.message ?? null}
              error={!!error}
              {...rest}
              {...restInput}
            />
          }
          {...calendarProps}
        />
      )}
    />
  );
};
