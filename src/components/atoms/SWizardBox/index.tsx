/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { Box } from '@mui/material';

import { SFlexProps } from './types';

const SWizardBox = React.forwardRef<any, SFlexProps>(
  ({ sx, ...props }, ref) => (
    <Box
      {...props}
      ref={ref}
      sx={{
        backgroundColor: 'grey.100',
        borderRadius: '10px 10px 10px 10px',
        boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
        ...sx,
      }}
    />
  ),
);

export default SWizardBox;
