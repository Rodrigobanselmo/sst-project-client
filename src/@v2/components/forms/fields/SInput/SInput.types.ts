import { TextFieldProps } from '@mui/material/TextField';
import { IStringTransformationsType } from '@v2/utils/string-transformation';

export type SInputProps = Pick<
  TextFieldProps,
  | 'onClick'
  | 'onChange'
  | 'value'
  | 'error'
  | 'variant'
  | 'helperText'
  | 'placeholder'
  | 'type'
  | 'autoFocus'
  | 'onFocus'
  | 'disabled'
  | 'sx'
  | 'inputRef'
  | 'fullWidth'
  | 'onBlur'
> & {
  label?: string;
  inputRef?: { current: HTMLInputElement | null };
  labelShrink?: string;
  variant?: 'outlined' | 'standard';
  size?: 'sm' | 'md' | 'lg';
  shrink?: boolean;
  inputProps?: TextFieldProps['InputProps'];
  loading?: boolean;
  shadow?: boolean;
  textFieldProps?: TextFieldProps;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  transformation?: IStringTransformationsType;
  color?: 'normal' | 'success' | 'info' | 'primary' | 'paper' | 'danger';
};
