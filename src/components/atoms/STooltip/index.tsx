import React, { FC } from 'react';

import { Box, Tooltip } from '@mui/material';

import { STooltipProps } from './types';

const STooltip: FC<STooltipProps> = ({
  title,
  children,
  withWrapper,
  minLength = 0,
  boxProps = {},
  ...props
}) => {
  if (!title) return <>{children}</>;
  if (typeof title == 'string' && title.length < minLength)
    return <>{children}</>;

  if (withWrapper)
    return (
      <Tooltip title={title} {...props}>
        <Box {...boxProps}>{children}</Box>
      </Tooltip>
    );
  return (
    <Tooltip title={title} {...props}>
      {children}
    </Tooltip>
  );
};

export default STooltip;
