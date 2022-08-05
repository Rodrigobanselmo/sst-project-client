/* eslint-disable react/display-name */
import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { Controller } from 'react-hook-form';

import pt from 'date-fns/locale/pt-BR';
import dayjs from 'dayjs';

import SDateIcon from 'assets/icons/SDateIcon';

import { dateMask } from 'core/utils/masks/date.mask';

import { SInput } from '../../../atoms/SInput';
import { InputFormProps } from './types';

registerLocale('pt', pt);

const years = Array.from({ length: 50 }).map(
  (_, i) => dayjs(new Date()).get('year') + i - 40,
);

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

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
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div
              style={{
                margin: 10,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
              >
                {'<'}
              </button>
              <select
                value={months[dayjs(date).get('month')]}
                onChange={({ target: { value } }) =>
                  changeMonth(months.indexOf(value))
                }
              >
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={dayjs(date).get('year')}
                onChange={({ target: { value } }) => changeYear(Number(value))}
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
              >
                {'>'}
              </button>
            </div>
          )}
          onChange={(date, e) => {
            func(date, e);
            onChange && onChange(date);
          }}
          onChangeRaw={(e) => {
            if (typeof e.target.value === 'string') {
              mask(e);
            }
          }}
          placeholderText={placeholderText}
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
