/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { STTextareaAutosize } from './styles';
import { STextareaProps } from './types';

const STextarea = React.forwardRef<any, STextareaProps>(
  ({ sx, preventResize = false, unstyled, ...props }, ref) => (
    <STTextareaAutosize
      unstyled={unstyled ? 1 : 0}
      sx={sx}
      resize={!preventResize ? 1 : 0}
      ref={ref}
      {...props}
    />
  ),
);

export default STextarea;
