import DatePicker, { registerLocale } from 'react-datepicker';

import pt from 'date-fns/locale/pt-BR';
import dayjs from 'dayjs';

import { dateMask } from 'core/utils/masks/date.mask';

import { Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { SInput } from '../SInput/SInput';
import { SDatePickerProps } from './types';
import { SIconDate } from '@v2/assets/icons/SIconDate/SIconAdd';

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

export function SDatePicker({
  label = '',
  uneditable,
  placeholderText = '__/__/____',
  inputFormat = 'dd/MM/yyyy',
  selected,
  mask = dateMask.apply,
  inputProps,
  onClear,
  onChange = () => null,
  ...props
}: SDatePickerProps) {
  return (
    <Box>
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
            {onClear && (
              <Box
                onClick={onClear}
                sx={{
                  position: 'absolute',
                  bottom: -200,
                  left: -1,
                  display: 'flex',
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'right',
                  width: 'calc(100% + 2px)',
                  backgroundColor: 'white',
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  padding: '5px 10px',
                  gap: 3,
                  border: '1px solid #aeaeae',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  '&:active': {
                    backgroundColor: '#f0f0f0',
                  },
                }}
              >
                {/* <NotInterestedIcon sx={{ fontSize: 13, color: 'text.main' }} /> */}
                <SText fontSize={12}>Limpar</SText>
              </Box>
            )}
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
            label={String(label)}
            fullWidth
            endAdornment={<SIconDate color="grey.600" fontSize={18} />}
            {...inputProps}
          />
        }
        {...props}
      />
    </Box>
  );
}
