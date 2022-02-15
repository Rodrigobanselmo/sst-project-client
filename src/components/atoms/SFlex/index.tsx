/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { Box } from '@mui/material';

import { SFlexProps } from './types';

const SFlex = React.forwardRef<any, SFlexProps>(
  ({ direction = 'row', gap = 2, center, align, justify, ...props }, ref) => (
    <Box
      alignItems={center ? 'center' : align}
      justifyContent={center ? 'center' : justify}
      display="flex"
      flexDirection={direction}
      gap={gap}
      ref={ref}
      {...props}
    />
  ),
);

export default SFlex;
