import { ChangeEvent } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import {
  BoxProps,
  FormControlLabelProps,
  FormControlProps,
} from '@mui/material';

export type RadioInputProps<T> = FormControlProps & {
  disabled?: boolean;
  value?: string | number | boolean;
  label?: string;
  renderLabel?: (option: T) => React.ReactNode;
  errorMessage?: string;
  valueField?: string;
  labelField?: string;
  helperText?: string;
  options: T[];
  row?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  formControlProps?: Partial<FormControlLabelProps>;
};

export type InputFormBoxProps<T> = FormControlProps & {
  name: string;
  disabled?: boolean;
  control: Control<any, object>;
  defaultValue?: string | number;
  label?: string;
  renderLabel?: (option: T) => string;
  valueField?: string;
  labelField?: string;
  helperText?: string;
  options: T[];
  row?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  boxProps?: Partial<Omit<BoxProps, 'defaultValue'>>;
  unmountOnChangeDefault?: boolean;
};
