import { ChangeEvent } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { BoxProps, FormControlProps } from '@mui/material';

export type InputFormBoxProps<T> = FormControlProps & {
  name: string;
  disabled?: boolean;
  control: Control<FieldValues, object>;
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
