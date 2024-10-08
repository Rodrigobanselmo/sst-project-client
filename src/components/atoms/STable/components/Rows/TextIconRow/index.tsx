import React, { FC, useMemo } from 'react';

import { CircularProgress, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { TextIconRowProps } from './types';

const TextIconRow: FC<{ children?: any } & TextIconRowProps> = ({
  tooltipTitle,
  text,
  icon,
  lineNumber = 2,
  children,
  onClick,
  fontSize = 12,
  lineHeight,
  loading,
  textAlign,
  sx,
  clickable,
  textProps = {},
  color,
  tooltipProps = {},
  ...props
}) => {
  const memoizedChildren = useMemo(() => {
    if (loading) return <CircularProgress size={16} />;

    return (
      <>
        {icon && (
          <Icon component={icon} sx={{ color: 'gray.600', mr: 4, ml: 2 }} />
        )}
        {text && (
          <SText
            textAlign={textAlign}
            fontSize={fontSize}
            lineNumber={lineNumber}
            lineHeight={lineHeight}
            className="table-row-text"
            color={color}
            {...textProps}
            sx={{ whiteSpace: 'pre-line', ...textProps?.sx }}
          >
            {text}
          </SText>
        )}
        {children}
      </>
    );
  }, [
    loading,
    icon,
    text,
    textAlign,
    fontSize,
    lineNumber,
    lineHeight,
    color,
    textProps,
    children,
  ]);

  return (
    <STooltip title={tooltipTitle ?? text} minLength={100} {...tooltipProps}>
      <SFlex
        onClick={onClick}
        sx={{
          cursor: onClick || clickable ? 'pointer' : 'default',
          height: '100%',
          ...sx,
        }}
        className="table-row-box"
        align="center"
        {...props}
      >
        {memoizedChildren}
      </SFlex>
    </STooltip>
  );
};

export default TextIconRow;
