import { ChangeEvent } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { BoxProps } from '@mui/material';
import { SRadioCheckboxProps } from 'components/atoms/SRadioCheckbox/types';

// eslint-disable-next-line @typescript-eslint/ban-types
export type InputFormProps = SRadioCheckboxProps & {};

export type InputFormBoxProps = BoxProps & {
  name: string;
  control: Control<FieldValues, object>;
  defaultValue?: string;
  label?: string;
  options: SRadioCheckboxProps['options'];
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  reset?: () => void;
  inputProps?: Partial<InputFormProps>;
  type: SRadioCheckboxProps['type'];
  columns: SRadioCheckboxProps['columns'];
};
