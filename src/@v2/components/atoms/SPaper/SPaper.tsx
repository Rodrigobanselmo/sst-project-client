import React from 'react';

import { Box } from '@mui/material';

import { SPaperProps } from './SPaper.types';

export const SPaper = React.forwardRef<any, SPaperProps>(
  ({ shadow = true, ...props }, ref) => (
    <Box
      ref={ref}
      {...props}
      sx={{
        borderRadius: '4px',
        backgroundColor: 'background.paper',
        ...(shadow
          ? {
              boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
              WebkitBoxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
            }
          : {
              border: '1px solid',
              borderColor: 'grey.300',
            }),
        ...props.sx,
      }}
    />
  ),
);
