import React, { FC } from 'react';

import { STTextareaAutosize } from './styles';
import { STextareaProps } from './types';

const STextarea: FC<STextareaProps> = ({ sx, resize = true, ...props }) => (
  <STTextareaAutosize sx={sx} resize={resize ? 1 : 0} {...props} />
);

export default STextarea;
