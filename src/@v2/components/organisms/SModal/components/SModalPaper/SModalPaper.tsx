import React from 'react';

import { Box, CircularProgress } from '@mui/material';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SModalPaperProps } from './SModalPaper.types';

export const SModalPaper = React.forwardRef<any, SModalPaperProps>(
  (
    {
      center = true,
      loading,
      children,
      semiFullScreen,
      fullScreen,
      sx,
      minWidthDesk = 400,
      ...props
    },
    ref,
  ) => {
    return (
      <>
        <SPaper
          ref={ref}
          p={[8, 8, 10]}
          sx={{
            transform: ['', '', `translateY(${center ? 0 : -150}px)`],
            minWidth: ['95vw', '95vw', minWidthDesk],
            maxWidth: ['95vw', '95vw', 900],
            overflowX: 'hidden',
            position: 'relative',
            ...(semiFullScreen
              ? {
                  minWidth: '95vw',
                  maxWidth: '95vw',
                  minHeight: '95vh',
                }
              : {}),
            ...(fullScreen
              ? {
                  minWidth: '100vw',
                  maxWidth: '100vw',
                  minHeight: '100vh',
                  overflowX: 'hidden',
                  borderRadius: 0,
                }
              : {}),
            backgroundColor: 'grey.50',
            ...sx,
          }}
          {...props}
        >
          {children}
        </SPaper>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'gray.100',
              zIndex: 1,
              opacity: 0.5,
            }}
          >
            <CircularProgress
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </Box>
        )}
      </>
    );
  },
);
