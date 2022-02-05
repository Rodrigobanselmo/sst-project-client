import React, { FC } from 'react';

import { Box } from '@mui/material';

import { SFlexProps } from './types';

const SFlex: FC<SFlexProps> = ({
  direction = 'row',
  gap = 2,
  center,
  align,
  justify,
  ...props
}) => (
  <Box
    alignItems={center ? 'center' : align}
    justifyContent={center ? 'center' : justify}
    display="flex"
    flexDirection={direction}
    gap={gap}
    {...props}
  />
);

export default SFlex;
