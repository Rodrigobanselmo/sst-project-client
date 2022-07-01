import React from 'react';

import { STModalPaper } from './styles';
import { SModalPaperProps } from './types';

/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const SModalPaper = React.forwardRef<any, SModalPaperProps>(
  (
    { center = false, children, semiFullScreen, fullScreen, sx, ...props },
    ref,
  ) => {
    return (
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
          ...sx,
        }}
        {...props}
      >
        {children}
      </STModalPaper>
    );
  },
);
