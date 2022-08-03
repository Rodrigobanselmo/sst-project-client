import { ChangeEvent, ReactNode } from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { Control, FieldValues } from 'react-hook-form';

import { SInputProps } from '../../../atoms/SInput/types';

export type InputFormProps = Partial<SInputProps> & {
  name: string;
  control: Control<FieldValues, object>;
  label?: ReactNode;
  onChange?: (e: Date | null) => void;
  uneditable?: boolean;
  mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  inputFormat?: string;
  calendarProps?: Partial<ReactDatePickerProps>;
};
