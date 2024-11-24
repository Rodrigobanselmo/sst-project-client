import { Stack } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import React from 'react';

import TabContentSkeleton from './TabContentSkeleton';

export interface TabSkeletonProps {
  repeat?: number;
}
export const TabSkeleton: React.FC<TabSkeletonProps> = ({ repeat = 1 }) => {
  return (
    <>
      <Stack direction="row" spacing={2}>
        <Skeleton variant="text" sx={{ fontSize: 36, width: 100 }} />
        <Skeleton variant="text" sx={{ fontSize: 36, width: 100 }} />
        <Skeleton variant="text" sx={{ fontSize: 36, width: 100 }} />
        <Skeleton variant="text" sx={{ fontSize: 36, width: 100 }} />
        <Skeleton variant="text" sx={{ fontSize: 36, width: 100 }} />
      </Stack>
      <TabContentSkeleton repeat={repeat} m={0} />
    </>
  );
};
