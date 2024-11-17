import React from 'react';

import { Skeleton } from '@mui/material';

import { SSkeletonProps } from './SDivider.types';

export const SSkeleton = React.forwardRef<any, SSkeletonProps>(
  ({ ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="rectangular"
      height={35}
      {...props}
      sx={{ borderRadius: 1, ...props.sx }}
    />
  ),
);
