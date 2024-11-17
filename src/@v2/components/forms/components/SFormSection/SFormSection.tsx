import React from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SFormSectionProps } from './SFormSection.types';

export const SFormSection = React.forwardRef<any, SFormSectionProps>(
  ({ ...props }, ref) => (
    <SFlex gap={8} direction="column" ref={ref} {...props} />
  ),
);
