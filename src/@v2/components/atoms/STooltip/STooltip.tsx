import React, { FC, PropsWithChildren } from 'react';

import { Box, Tooltip } from '@mui/material';

import { STooltipProps } from './STooltip.types';

const STooltip: FC<PropsWithChildren<STooltipProps>> = ({
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
