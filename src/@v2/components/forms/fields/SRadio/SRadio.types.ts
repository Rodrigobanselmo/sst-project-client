import { FormControlProps } from '@mui/material';

export interface SRadioProps<T = any>
  extends Omit<FormControlProps, 'onChange' | 'error' | 'size'> {
  label?: string;
  options?: T[];
  value?: T | null;
  onChange?: (value: T | null) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number | boolean;
  error?: boolean | string;
  errorMessage?: string;
  size?: 'small' | 'medium';
}
