import React from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SFormLabelProps } from './SFormLabel.types';
import { SText } from '@v2/components/atoms/SText/SText';

export const SFormLabel = React.forwardRef<any, SFormLabelProps>(
  ({ children, ...props }, ref) => (
    <SText mb={-2} ref={ref} {...props}>
      {children}
    </SText>
  ),
);
