import React, { FC } from 'react';

import { STTypography } from './SText.styles';
import { STextProps } from './SText.types';

export const SText: React.FC<STextProps> = ({
  textAlign = 'start',
  lineNumber,
  noBreak,
  color = 'text.main',
  ...props
}) => (
  <STTypography
    color={color}
    textAlign={textAlign}
    line_number={lineNumber}
    no_break={noBreak ? 1 : 0}
    {...props}
  />
);
