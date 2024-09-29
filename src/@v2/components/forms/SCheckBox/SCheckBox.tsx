import React from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { SCheckBoxProps } from './SCheckBox.types';

export const SCheckBox = React.forwardRef<any, SCheckBoxProps>(
  ({ label, sx, ...props }, ref) => (
    <FormControlLabel
      label={label}
      sx={{ '.MuiFormControlLabel-label': { fontSize: 14 }, ...sx }}
      control={
        <Checkbox
          sx={{
            'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
              color: 'grey.400',
              fontSize: '1.0rem',
            },
            '.MuiSvgIcon-root': {
              fontSize: '1.1rem',
            },
          }}
          {...props}
          ref={ref}
        />
      }
    />
  ),
);
