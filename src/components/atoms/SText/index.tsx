import React, { FC } from 'react';

import { STTypography } from './styles';
import { STypographyProps } from './types';

const SText: FC<STypographyProps> = ({
  textAlign = 'start',
  lineNumber,
  ...props
}) => (
  <STTypography textAlign={textAlign} line_number={lineNumber} {...props} />
);

export default SText;
