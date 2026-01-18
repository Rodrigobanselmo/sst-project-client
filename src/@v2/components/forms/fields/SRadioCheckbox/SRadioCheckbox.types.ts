import { FormControlProps } from '@mui/material';

export interface SRadioCheckboxProps<T = any>
  extends Omit<FormControlProps, 'onChange' | 'error' | 'size'> {
  label?: string;
  options?: T[];
  value?: T[];
  onChange?: (value: T[]) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  error?: boolean | string;
  errorMessage?: string;
  size?: 'small' | 'medium';
  /** Enable text-to-speech buttons for each option (accessibility for users who cannot read) */
  enableSpeak?: boolean;
}
