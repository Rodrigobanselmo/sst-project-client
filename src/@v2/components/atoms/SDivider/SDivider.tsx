import React from 'react';

import { Divider } from '@mui/material';

import { SDividerProps } from './SDivider.types';

export const SDivider = React.forwardRef<any, SDividerProps>(
  ({ ...props }, ref) => <Divider ref={ref} {...props} />,
);
