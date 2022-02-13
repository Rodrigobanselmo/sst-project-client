import React, { FC } from 'react';

import { Box } from '@mui/material';

import { SContainerProps } from './types';

export const SContainer: FC<SContainerProps> = ({ children }) => {
  return (
    <Box px={[10, 10, 15]} py={[10, 10, 15]}>
      {children}
    </Box>
  );
};
