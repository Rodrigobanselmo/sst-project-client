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
  fontSize = 13,
  loading,
  textAlign,
  sx,
  clickable,
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
            sx={{ whiteSpace: 'pre-line' }}
            lineNumber={lineNumber}
            className="table-row-text"
          >
            {text}
          </SText>
        )}
        {children}
      </>
    );
  }, [children, fontSize, icon, lineNumber, loading, text, textAlign]);

  return (
    <STooltip title={tooltipTitle || text} minLength={100}>
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
