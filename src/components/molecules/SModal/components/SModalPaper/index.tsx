import React from 'react';

import { STModalPaper } from './styles';
import { SModalPaperProps } from './types';

/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const SModalPaper = React.forwardRef<any, SModalPaperProps>(
  ({ children, ...props }, ref) => {
    return (
      <STModalPaper ref={ref} maxWidth={['95%', '95%', 900]} {...props}>
        {children}
      </STModalPaper>
    );
  },
);
