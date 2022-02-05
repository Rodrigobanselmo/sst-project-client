import React, { FC } from 'react';

import { STTextareaAutosize } from './styles';
import { STextareaProps } from './types';

const STextarea: FC<STextareaProps> = ({
  sx,
  preventResize = false,
  unstyled,
  ...props
}) => (
  <STTextareaAutosize
    unstyled={unstyled ? 1 : 0}
    sx={sx}
    resize={!preventResize ? 1 : 0}
    {...props}
  />
);

export default STextarea;
