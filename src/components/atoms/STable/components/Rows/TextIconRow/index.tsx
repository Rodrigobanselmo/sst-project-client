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
  loading,
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
          <SText fontSize={15} lineNumber={lineNumber}>
            {text}
          </SText>
        )}
        {children}
      </>
    );
  }, [children, icon, lineNumber, loading, text]);

  return (
    <STooltip title={tooltipTitle}>
      <SFlex
        onClick={onClick}
        sx={{ cursor: onClick ? 'pointer' : 'default', ...sx }}
        align="center"
        {...props}
      >
        {memoizedChildren}
      </SFlex>
    </STooltip>
  );
};

export default TextIconRow;
