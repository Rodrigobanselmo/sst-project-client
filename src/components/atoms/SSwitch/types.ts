import { FormControlLabelProps, SwitchProps } from '@mui/material';

export interface SSwitchProps extends SwitchProps {
  label: string;
  formControlProps?: Partial<FormControlLabelProps>;
  fontSize?: string;
  color?: string;
}
