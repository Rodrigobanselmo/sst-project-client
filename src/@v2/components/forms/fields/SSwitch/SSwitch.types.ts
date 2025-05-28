import { FormControlLabelProps, SwitchProps } from '@mui/material';

export interface SSwitchProps {
  label: string;
  formControlProps?: Partial<FormControlLabelProps>;
  fontSize?: string;
  color?: string;
  value?: boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  switchProps?: SwitchProps;
  errorMessage?: string;
}
