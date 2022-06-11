import React, { FC } from 'react';

import { Tooltip } from '@mui/material';

import { STooltipProps } from './types';

const STooltip: FC<STooltipProps> = ({
  title,
  children,
  withWrapper,
  minLength = 0,
  ...props
}) => {
  if (!title) return <>{children}</>;
  if (typeof title == 'string' && title.length < minLength)
    return <>{children}</>;

  if (withWrapper)
    return (
      <Tooltip title={title} {...props}>
        <div>{children}</div>
      </Tooltip>
    );
  return (
    <Tooltip title={title} {...props}>
      {children}
    </Tooltip>
  );
};

export default STooltip;
