import React from 'react';

import { Box } from '@mui/material';

import { SPaperProps } from './SPaper.types';

export const SPaper = React.forwardRef<any, SPaperProps>(
  ({ ...props }, ref) => (
    <Box
      ref={ref}
      {...props}
      sx={{
        borderRadius: '4px',
        backgroundColor: 'background.paper',
        boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
        WebkitBoxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
        ...props.sx,
      }}
    />
  ),
);
