import React, { FC, useMemo } from 'react';

import { CircularProgress, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { TextIconRowProps } from './types';

const TextIconRow: FC<TextIconRowProps> = ({
  tooltipTitle,
  text,
  icon,
  lineNumber = 2,
  children,
  onClick,
  fontSize = 15,
  loading,
  textAlign,
  sx,
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
          >
            {text}
          </SText>
        )}
        {children}
      </>
    );
  }, [children, fontSize, icon, lineNumber, loading, text, textAlign]);

  return (
    <STooltip title={tooltipTitle}>
      <SFlex
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          height: '100%',
          ...sx,
        }}
        align="center"
        {...props}
      >
        {memoizedChildren}
      </SFlex>
    </STooltip>
  );
};

export default TextIconRow;
