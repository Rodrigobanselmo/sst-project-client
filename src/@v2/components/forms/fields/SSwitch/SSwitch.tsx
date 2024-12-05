import { FC } from 'react';

import { FormControlLabel } from '@mui/material';

import { STSwitch } from './SSwitch.styles';
import { SSwitchProps } from './SSwitch.types';

export const SSwitch: FC<{ children?: any } & SSwitchProps> = ({
  formControlProps = {},
  fontSize = '14px',
  label,
  color = 'primary.text',
  switchProps,
  value,
  onChange,
}) => {
  const { sx: formSx, ...formProps } = formControlProps;
  return (
    <FormControlLabel
      sx={{ '& .MuiFormControlLabel-label': { fontSize, color }, ...formSx }}
      control={
        <STSwitch
          checked={value}
          onChange={onChange}
          sx={{ mr: 2, ...switchProps?.sx }}
          {...switchProps}
        />
      }
      label={label}
      {...formProps}
    />
  );
};
