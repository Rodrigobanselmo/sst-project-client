/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { CircularProgress, Icon } from '@mui/material';

import SText from '../SText';
import { STSBoxButton } from './styles';
import { ISTagButtonProps } from './types';

export const STagButton = React.forwardRef<any, ISTagButtonProps>(
  (
    {
      text,
      large,
      icon,
      sx,
      onClick,
      disabled,
      iconProps = {},
      loading,
      error,
      ...props
    },
    ref,
  ) => {
    const { sx: iconSx, ...restIconProps } = iconProps;

    return (
      <STSBoxButton
        ref={ref}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: large ? 30 : 22,
          maxHeight: large ? 30 : 22,
          height: large ? 30 : 22,
          pl: 3,
          pr: text ? 5 : 2,
          ...sx,
        }}
        error={error ? 1 : 0}
        onClick={loading || disabled ? undefined : onClick}
        {...props}
      >
        {icon && !loading && (
          <Icon
            sx={{ fontSize: 14, mr: 2, ...iconSx }}
            component={icon}
            {...restIconProps}
          />
        )}
        {loading && (
          <CircularProgress
            size={large ? 13 : 11}
            sx={{ mr: large ? 3 : 2, ...iconSx }}
            color="secondary"
          />
        )}
        {text && (
          <SText
            fontSize="13px"
            color="text.primary"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {text}
          </SText>
        )}
      </STSBoxButton>
    );
  },
);
