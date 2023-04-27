import { ChangeEvent, ReactNode } from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { Control, FieldValues } from 'react-hook-form';

import { BoxProps } from '@mui/material';

import { SInputProps } from '../../../atoms/SInput/types';

export type InputDateFormProps = Partial<SInputProps> & {
  name: string;
  control: Control<FieldValues, object>;
  label?: ReactNode;
  onChange?: (e: Date | null) => void;
  uneditable?: boolean;
  mask?:
    | ((e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void)
    | null;
  inputFormat?: string;
  clearIfEmpty?: boolean;
  placeholderText?: string;
  calendarProps?: Partial<ReactDatePickerProps>;
  unmountOnChangeDefault?: boolean;
  setValue?: (name: string, value: string) => void;
  boxProps?: Partial<Omit<BoxProps, 'defaultValue'>>;
};
