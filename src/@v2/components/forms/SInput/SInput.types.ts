import { TextFieldProps } from '@mui/material/TextField';

export type SInputProps = Pick<
  TextFieldProps,
  | 'onChange'
  | 'value'
  | 'error'
  | 'helperText'
  | 'placeholder'
  | 'type'
  | 'autoFocus'
  | 'onFocus'
  | 'sx'
  | 'inputRef'
  | 'fullWidth'
  | 'onBlur'
> & {
  label?: string;
  inputRef?: { current: HTMLInputElement | null };
  labelShrink?: string;
  size?: 'sm' | 'md';
  shrink?: boolean;
  inputProps?: TextFieldProps['InputProps'];
  shadow?: boolean;
  textFieldProps?: TextFieldProps;
};
