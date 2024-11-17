import { ChangeEvent, ReactNode } from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import { SInputProps } from '../SInput/SInput.types';

export type SDatePickerProps = Partial<ReactDatePickerProps> & {
  label?: ReactNode;
  uneditable?: boolean;
  mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  inputFormat?: string;
  inputProps?: Partial<SInputProps>;
  onClear?: () => void;
  onChange(
    date: Date | null,
    event: React.SyntheticEvent<any, Event> | undefined,
  ): void;
};
