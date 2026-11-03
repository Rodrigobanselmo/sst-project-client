import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import Close from '@mui/icons-material/Close';
import { ptBR } from '@mui/x-date-pickers/locales';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';

import {
  civilCalendarYears,
  civilDateDisplay,
  civilDateInput,
  civilDateIso,
  civilDateValue,
} from './civil-date';

type SstDateFieldProps = Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (valid: boolean) => void;
};

export function useSstDateValidity() {
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>(
    {},
  );
  const dateFieldValidity = useCallback(
    (field: string) => (valid: boolean) => {
      setInvalidFields((current) =>
        current[field] === !valid ? current : { ...current, [field]: !valid },
      );
    },
    [],
  );
  return {
    datesValid: !Object.values(invalidFields).some(Boolean),
    dateFieldValidity,
  };
}

/** The existing MUI calendar, with a fixed Brazilian display and an ISO contract. */
export function SstDateField({
  value,
  onChange,
  onValidityChange,
  label,
  disabled,
  fullWidth = true,
  helperText,
  error,
  ...fieldProps
}: SstDateFieldProps) {
  const [calendar, setCalendar] = useState<Dayjs | null>(() =>
    civilDateValue(value),
  );
  const [text, setText] = useState(() => civilDateDisplay(value));
  const [invalid, setInvalid] = useState(!!value && !civilDateValue(value));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const calendarId = useId();
  const published = useRef(value);
  const validity = useRef(onValidityChange);
  validity.current = onValidityChange;

  useEffect(() => {
    validity.current(!invalid);
    return () => validity.current(true);
    // Report the initial state once; subsequent edits and external values have
    // their own callbacks, and unmount removes this field from the form guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // An invalid/partial edit publishes an empty ISO but keeps its own sections
    // so the author can fix it. External source changes still replace the draft.
    if (value === published.current) return;
    published.current = value;
    const next = civilDateValue(value);
    setCalendar(next);
    setText(civilDateDisplay(value));
    setInvalid(!!value && !next);
    validity.current(!value || !!next);
  }, [value]);

  const publish = (raw: string) => {
    const draft = civilDateInput(raw);
    setText(draft.text);
    setCalendar(civilDateValue(draft.iso));
    setInvalid(draft.invalid);
    published.current = draft.iso;
    validity.current(!draft.invalid);
    onChange(draft.iso);
  };
  const closeCalendar = () => {
    setAnchor(null);
    setCalendar(civilDateValue(published.current));
  };
  const calendarLabel = `Calendário: ${typeof label === 'string' ? label : 'selecionar data'}`;
  const calendarYears = civilCalendarYears(calendar);
  return (
    <>
      <TextField
        {...fieldProps}
        label={label}
        value={text}
        type="text"
        fullWidth={fullWidth}
        disabled={disabled}
        placeholder="DD/MM/AAAA"
        error={!!error || invalid}
        helperText={
          invalid
            ? 'Informe uma data válida no formato DD/MM/AAAA.'
            : helperText
        }
        InputLabelProps={{ shrink: true, ...fieldProps.InputLabelProps }}
        inputProps={{
          ...fieldProps.inputProps,
          inputMode: 'numeric',
          maxLength: 10,
        }}
        InputProps={{
          ...fieldProps.InputProps,
          endAdornment: (
            <InputAdornment position="end">
              {text && !disabled && (
                <IconButton
                  type="button"
                  size="small"
                  aria-label={`Limpar ${String(label)}`}
                  onClick={() => publish('')}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
              <IconButton
                type="button"
                size="small"
                disabled={disabled}
                aria-label={`Abrir calendário: ${String(label)}`}
                aria-haspopup="dialog"
                aria-expanded={!!anchor}
                aria-controls={anchor ? calendarId : undefined}
                onClick={(event) => setAnchor(event.currentTarget)}
              >
                <CalendarMonthOutlined fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={(event) => publish(event.target.value)}
      />
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={closeCalendar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        marginThreshold={16}
      >
        <Box id={calendarId} role="dialog" aria-label={calendarLabel}>
          <LocalizationProvider
            localeText={
              ptBR.components.MuiLocalizationProvider.defaultProps.localeText
            }
          >
            <DateCalendar
              value={calendar}
              disabled={disabled}
              minDate={dayjs()
                .year(calendarYears.minYear)
                .month(0)
                .date(1)
                .startOf('day')}
              maxDate={dayjs()
                .year(calendarYears.maxYear)
                .month(11)
                .date(31)
                .startOf('day')}
              onChange={(date, selectionState) => {
                setCalendar(date);
                if (selectionState === 'finish') {
                  const iso = civilDateIso(date);
                  if (iso) {
                    publish(civilDateDisplay(iso));
                    setAnchor(null);
                  }
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      </Popover>
    </>
  );
}
