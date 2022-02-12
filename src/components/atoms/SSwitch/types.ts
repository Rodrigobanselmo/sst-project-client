import { FormControlLabelProps, SwitchProps } from '@mui/material';

export interface SSwitchProps extends Omit<SwitchProps, 'color'> {
  label: string;
  formControlProps?: Partial<FormControlLabelProps>;
  fontSize?: string;
  color?: string;
}
