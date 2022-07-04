/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { Box, CircularProgress, Icon } from '@mui/material';

import SFlex from '../SFlex';
import SText from '../SText';
import STooltip from '../STooltip';
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
      active,
      bg,
      tooltipTitle,
      subText,
      topText,
      ...props
    },
    ref,
  ) => {
    const { sx: iconSx, ...restIconProps } = iconProps;

    return (
      <STooltip title={tooltipTitle}>
        <STSBoxButton
          active={active ? 1 : 0}
          disabled={disabled ? 1 : 0}
          bg={bg}
          onClick={loading || disabled ? undefined : onClick}
          error={error ? 1 : 0}
          ref={ref}
          sx={{
            minHeight:
              (large ? 32 : 22) + (subText ? 10 : 0) + (topText ? 12 : 0),
            maxHeight:
              (large ? 32 : 22) + (subText ? 10 : 0) + (topText ? 12 : 0),
            height: (large ? 32 : 22) + (subText ? 10 : 0) + (topText ? 12 : 0),
            pl: 3,
            pr: text ? 3 : 2,
            ...sx,
          }}
          {...props}
        >
          {topText && (
            <SText
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: active ? 'common.white' : 'common.black',
                mb: '-1px',
              }}
              fontSize="10px"
              color="text.light"
              width="100%"
            >
              {topText}
            </SText>
          )}
          <SFlex width="90%" center flex={1}>
            {icon && !loading && (
              <Icon
                sx={{
                  fontSize: 14,
                  mr: 2,
                  color: active ? 'common.white' : 'common.black',
                  ...iconSx,
                }}
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
              <SFlex align="center" justify="center">
                <SText
                  fontSize="13px"
                  color="text.primary"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: active ? 'common.white' : 'common.black',
                    textAlign: 'center',
                    mb: -1,
                  }}
                >
                  {text}
                </SText>
              </SFlex>
            )}
          </SFlex>
          {subText && (
            <SText
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: active ? 'common.white' : 'common.black',
              }}
              fontSize="10px"
              color="text.light"
              width="100%"
            >
              {subText}
            </SText>
          )}
        </STSBoxButton>
      </STooltip>
    );
  },
);
