import React, { FC } from 'react';

import { STTypography } from './styles';
import { STextProps } from './types';

const SText: FC<STextProps> = ({
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
    no_break={noBreak}
    {...props}
  />
);

export default SText;
