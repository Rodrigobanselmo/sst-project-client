/* eslint-disable react/display-name */
import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import pt from 'date-fns/locale/pt-BR';
import dayjs from 'dayjs';

import SDateIcon from 'assets/icons/SCalendarIcon';

import { dateMask } from 'core/utils/masks/date.mask';

import { SInput } from '../SInput';
import { SDatePickerProps } from './types';

registerLocale('pt', pt);

const years = Array.from({ length: 110 }).map(
  (_, i) => dayjs(new Date()).get('year') + i - 100,
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

const DatePickerInput = DatePicker as any;

/**
 * @deprecated
 * This method is deprecated and has been replaced by newMethod()
 */
export function SDatePicker({
  label = '',
  uneditable,
  placeholderText,
  inputFormat = 'dd/MM/yyyy',
  selected,
  mask = dateMask.apply,
  inputProps,
  onChange = () => null,
  ...props
}: SDatePickerProps) {
  return (
    <DatePickerInput
      locale="pt"
      onChange={onChange}
      selected={selected}
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
            type="button"
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
            type="button"
          >
            {'>'}
          </button>
        </div>
      )}
      onChangeRaw={(e) => {
        if (typeof e.target.value === 'string') {
          mask?.(e);
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
          {...inputProps}
        />
      }
      {...props}
    />
  );
}
