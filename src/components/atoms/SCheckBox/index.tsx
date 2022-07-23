/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { SCheckBoxProps } from './types';

const SCheckBox = React.forwardRef<any, SCheckBoxProps>(
  ({ label, ...props }, ref) => (
    <FormControlLabel
      label={label}
      sx={{ '.MuiFormControlLabel-label': { fontSize: 14 } }}
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

export default SCheckBox;
