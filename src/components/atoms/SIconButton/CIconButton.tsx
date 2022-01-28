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
  ...props
}) => (
  <IconButton disabled={loading || disabled} size={size} {...props}>
    {loading ? (
      <CircularProgress size={size === 'small' ? 20 : 22} {...circularProps} />
    ) : (
      children
    )}
  </IconButton>
);

export default SIconButton;
