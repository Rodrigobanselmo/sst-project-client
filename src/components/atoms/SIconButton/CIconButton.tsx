import React, { FC } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import { SIconButtonProps } from '.';

const SIconButton: FC<SIconButtonProps> = ({
  circularProps,
  loading,
  children,
  disabled,
  size,
  bg,
  sx,
  ...props
}) => (
  <IconButton
    sx={
      bg
        ? {
            backgroundColor: bg,
            boxShadow: 'rgb(0 0 0 / 9%) 0px 3px 12px',
            '&:hover': {
              backgroundColor: bg,
              filter: 'brightness(0.9)',
            },
            '&:active': {
              backgroundColor: bg,
            },
            ...sx,
          }
        : { ...sx }
    }
    disabled={loading || disabled}
    size={size}
    {...props}
  >
    {loading ? (
      <CircularProgress size={size === 'small' ? 20 : 22} {...circularProps} />
    ) : (
      children
    )}
  </IconButton>
);

export default SIconButton;
