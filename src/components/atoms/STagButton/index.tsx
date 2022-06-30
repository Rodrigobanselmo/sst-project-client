/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { Box, CircularProgress, Icon } from '@mui/material';

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
          bg={bg}
          ref={ref}
          display="flex"
          alignItems="center"
          justifyContent="center"
          active={active ? 1 : 0}
          disabled={disabled ? 1 : 0}
          sx={{
            minHeight:
              (large ? 30 : 22) + (subText ? 10 : 0) + (topText ? 12 : 0),
            maxHeight:
              (large ? 30 : 22) + (subText ? 10 : 0) + (topText ? 12 : 0),
            height: (large ? 30 : 22) + (subText ? 10 : 0) + (topText ? 12 : 0),
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
            <Box>
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
              <SText
                fontSize="13px"
                color="text.primary"
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: active ? 'common.white' : 'common.black',
                }}
              >
                {text}
              </SText>
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
            </Box>
          )}
        </STSBoxButton>
      </STooltip>
    );
  },
);
