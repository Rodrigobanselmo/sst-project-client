import { Box, BoxProps, TextFieldProps } from '@mui/material';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import React, { useEffect } from 'react';
import { SInput } from '../SInput/SInput';

export type SDatePickerProps = Omit<
  Partial<DatePickerProps<Dayjs>>,
  'value' | 'onChange'
> & {
  error?: string;
  value?: Date | null;
  errorMessage?: string;
  getFieldValue?: (value: any) => any;
  onChange?: (date: Date | null) => void;
  textFieldProps?: TextFieldProps;
  boxProps?: BoxProps;
};

export const SDatePicker = ({
  label,
  onChange,
  value,
  errorMessage,
  textFieldProps,
  boxProps,
  ...props
}: SDatePickerProps) => {
  const dayJSRef = React.useRef<Dayjs | null>(value ? dayjs(value) : null);

  const handleChange = (value: dayjs.Dayjs | null) => {
    dayJSRef.current = value;

    value?.isValid()
      ? onChange?.(value ? value.toDate() : value)
      : onChange?.(null);
  };

  useEffect(() => {
    if (value) dayJSRef.current = dayjs(value);
  }, [value]);

  return (
    <Box {...boxProps}>
      <DatePicker
        {...props}
        label={label}
        value={
          value ? dayjs(value) : value === undefined ? null : dayJSRef.current
        }
        onChange={handleChange}
        localeText={{
          fieldDayPlaceholder: () => '__',
          fieldMonthPlaceholder: () => '__',
          fieldYearPlaceholder: () => '____',
        }}
        slots={{
          textField: SCustomDateInput,
        }}
        sx={{}}
        slotProps={{
          textField: {
            label: String(label),
            error: !!errorMessage,
            helperText: errorMessage,
            sx: {
              minWidth: 1000,
            },
            ...textFieldProps,
          },
        }}
      />
    </Box>
  );
};

const SCustomDateInput = (props: any) => {
  return (
    <SInput
      inputRef={props.inputRef}
      label={props.label}
      error={props.error}
      helperText={props.helperText}
      fullWidth
      endAdornment={props.InputProps?.endAdornment}
      inputProps={props.InputProps}
      onChange={props.onChange}
      textFieldProps={props}
      placeholder={props.placeholder || '__/__/____'}
      value={props.value}
      autoFocus={props.autoFocus}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
};

// const SDatePickerTextField = ({ ...props }: SInputProps) => {
//   const pickersContext = usePickersContext();
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [hasOpened, sethasOpened] = useState(false);

//   const simulateLeftArrowKey = () => {
//     if (inputRef.current) {
//       const event = new KeyboardEvent('keydown', {
//         key: 'ArrowLeft',
//         code: 'ArrowLeft',
//         keyCode: 37,
//         charCode: 0,
//         bubbles: true,
//       });
//       inputRef.current.dispatchEvent(event);
//     }
//   };

//   const open = (event: React.UIEvent) => {
//     if (hasOpened) return;

//     pickersContext.onOpen(event);
//     setTimeout(() => {
//       inputRef.current?.focus();
//       simulateLeftArrowKey();
//       setTimeout(() => {
//         simulateLeftArrowKey();
//         setTimeout(() => {
//           simulateLeftArrowKey();
//           sethasOpened(true);
//         }, 0);
//       }, 0);
//     }, 0);
//   };

//   return (
//     <SInput
//       {...props}
//       inputRef={hasOpened ? undefined : inputRef}
//       onClick={hasOpened ? undefined : open}
//     />
//   );
// };
