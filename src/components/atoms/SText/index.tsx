import React, { FC } from 'react';

import { STTypography } from './styles';
import { STextProps } from './types';

/**
 * @deprecated
 * This method is deprecated and has been replaced by newMethod()
 */
const SText: FC<{ children?: any } & STextProps> = ({
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

export default SText;
