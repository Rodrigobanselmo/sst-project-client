import { Box, BoxProps, Stack } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import React from 'react';

export interface TabContentSkeletonProps extends BoxProps {
  repeat?: number;
}
const TabContentSkeleton: React.FC<TabContentSkeletonProps> = ({
  repeat = 1,
  m = 2,
  ...props
}) => {
  const skeletons = Array.from({ length: repeat }, (_, i) => (
    <Skeleton key={i} variant="rectangular" height={62} sx={{ m: 2 }} />
  ));

  return (
    <Box m={m} {...props}>
      <Stack direction="row" justifyContent="space-between">
        <Skeleton variant="text" sx={{ fontSize: 36, width: 100 }} />
        <Skeleton variant="rectangular" sx={{ height: 24, width: 100 }} />
      </Stack>
      {skeletons}
    </Box>
  );
};

export default TabContentSkeleton;
