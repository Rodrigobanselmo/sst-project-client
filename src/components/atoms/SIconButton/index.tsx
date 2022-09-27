import React, { FC } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import STooltip from '../STooltip';
import { SIconButtonProps } from './types';

const SIconButton: FC<SIconButtonProps> = ({
  circularProps,
  loading,
  children,
  disabled,
  size,
  bg,
  tooltip,
  sx,
  ...props
}) => (
  <STooltip
    withWrapper
    boxProps={{ sx: { display: 'inline', ...(tooltip ? { ...sx } : {}) } }}
    title={tooltip}
  >
    <IconButton
      sx={{
        ...(bg && {
          backgroundColor: bg,
          boxShadow: 'rgb(0 0 0 / 5%) 0px 3px 12px',
          '&:hover': {
            backgroundColor: bg,
            filter: 'brightness(0.9)',
          },
          '&:active': {
            backgroundColor: bg,
          },
        }),
        ...(disabled && { opacity: 0.4 }),
        ...sx,
      }}
      disabled={loading || disabled}
      size={size}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={size === 'small' ? 20 : 22}
          {...circularProps}
        />
      ) : (
        children
      )}
    </IconButton>
  </STooltip>
);

export default SIconButton;
