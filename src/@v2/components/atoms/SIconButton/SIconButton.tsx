import React, { FC, PropsWithChildren } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import STooltip from '../STooltip/STooltip';
import { SIconButtonProps } from './SIconButton.types';

export const SIconButton: FC<PropsWithChildren<SIconButtonProps>> = ({
  circularProps,
  loading,
  children,
  disabled,
  size,
  bg,
  tooltip,
  onClick,
  iconButtonProps,
}) => (
  <STooltip
    withWrapper
    boxProps={{ sx: { display: 'inline' } }}
    title={tooltip}
  >
    <IconButton
      onClick={onClick}
      disabled={loading || disabled}
      size={size}
      {...iconButtonProps}
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
        ...iconButtonProps?.sx,
      }}
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
