import React from 'react';

import { STModalPaper } from './styles';
import { SModalPaperProps } from './types';
import { Box, CircularProgress } from '@mui/material';

/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const SModalPaper = React.forwardRef<any, SModalPaperProps>(
  (
    {
      center = true,
      loading,
      children,
      semiFullScreen,
      fullScreen,
      sx,
      ...props
    },
    ref,
  ) => {
    return (
      <>
        <STModalPaper
          ref={ref}
          p={[8, 8, 12]}
          sx={{
            transform: ['', '', `translateY(${center ? 0 : -150}px)`],
            minWidth: ['95%', '95%', 400],
            maxWidth: ['95%', '95%', 900],
            overflowX: 'hidden',
            position: 'relative',
            ...(semiFullScreen
              ? {
                  minWidth: '95vw',
                  maxWidth: '95vw',
                  minHeight: '95%',
                }
              : {}),
            ...(fullScreen
              ? {
                  minWidth: '100vw',
                  maxWidth: '100vw',
                  minHeight: '100%',
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
        </STModalPaper>
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
