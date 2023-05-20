import { FC } from 'react';

import { FormControlLabel } from '@mui/material';

import { STSwitch } from './styles';
import { SSwitchProps } from './types';

export const SSwitch: FC<{ children?: any } & SSwitchProps> = ({
  formControlProps = {},
  fontSize = '14px',
  label,
  color = 'primary.text',
  sx,
  ...props
}) => {
  const { sx: formSx, ...formProps } = formControlProps;
  return (
    <FormControlLabel
      sx={{ '& .MuiFormControlLabel-label': { fontSize, color }, ...formSx }}
      control={<STSwitch sx={{ mr: 2, ...sx }} {...props} />}
      label={label}
      {...formProps}
    />
  );
};
