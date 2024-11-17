import React from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SFormRowProps } from './SFormRow.types';

export const SFormRow = React.forwardRef<any, SFormRowProps>(
  ({ ...props }, ref) => <SFlex gap={8} ref={ref} {...props} />,
);
