import { TextFieldProps } from '@mui/material/TextField';

export type SInputProps = Pick<
  TextFieldProps,
  | 'onChange'
  | 'value'
  | 'helperText'
  | 'placeholder'
  | 'type'
  | 'autoFocus'
  | 'onFocus'
  | 'sx'
  | 'inputRef'
  | 'onBlur'
> & {
  label?: string;
  labelShrink?: string;
  size?: 'sm' | 'md';
  inputProps?: TextFieldProps['InputProps'];
};
