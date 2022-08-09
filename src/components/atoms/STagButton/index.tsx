/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { CircularProgress, Icon } from '@mui/material';

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
      width,
      tooltipTitle,
      subText,
      topText,
      showOnHover,
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
            ...(showOnHover
              ? {
                  width: '20px',
                  transition: 'width 0.2s ease-in-out',
                  '.icon_main': {
                    mr: '-2px',
                  },
                  '&:hover': {
                    width,
                    '.icon_main': {
                      mr: '0px',
                    },
                  },
                }
              : { width }),
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
          <SFlex center width="100%">
            {icon && !loading && (
              <Icon
                sx={{
                  fontSize: 14,
                  mr: 2,
                  color: active ? 'common.white' : 'common.black',
                  ...iconSx,
                }}
                className="icon_main"
                component={icon}
                {...restIconProps}
              />
            )}
            {loading && (
              <SFlex center>
                <CircularProgress
                  size={large ? 13 : 11}
                  sx={{ mr: large ? 3 : 2, ...iconSx }}
                  color="secondary"
                />
              </SFlex>
            )}
            {text && (
              <SText
                fontSize="13px"
                color="text.primary"
                className="text_main"
                noBreak
                sx={{
                  color: active ? 'common.white' : 'common.black',
                  mb: -1,
                }}
              >
                {text}
              </SText>
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
