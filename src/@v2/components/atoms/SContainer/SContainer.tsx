import React, { FC } from 'react';

import { Box } from '@mui/material';

import { SContainerProps } from './SContainer.types';

export const SContainer: FC<{ children?: any } & SContainerProps> = ({
  children,
  ...props
}) => {
  return (
    <Box px={[10, 10, 15]} py={[10, 10, 15]} {...props}>
      {children}
    </Box>
  );
};
