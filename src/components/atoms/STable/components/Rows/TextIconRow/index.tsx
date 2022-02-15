import React, { FC } from 'react';

import { Icon } from '@mui/material';
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
  sx,
  ...props
}) => (
  <STooltip title={tooltipTitle}>
    <SFlex
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'default', ...sx }}
      align="center"
      {...props}
    >
      {icon && (
        <Icon component={icon} sx={{ color: 'gray.600', mr: 4, ml: 2 }} />
      )}
      {text && <SText lineNumber={lineNumber}>{text}</SText>}
      {children}
    </SFlex>
  </STooltip>
);

export default TextIconRow;
