import React from 'react';
import { SInputForm } from '../SInputForm/SInputForm';
import { SInputFormProps } from '../SInputForm/SInputForm';
import { createMaskOnlyNumberWithLimits } from '@v2/utils/@masks/only-number-with-limits.mask';

export interface SInputNumberLimitedFormProps
  extends Omit<SInputFormProps, 'transformation' | 'type'> {
  min?: number;
  max?: number;
}

export const SInputNumberLimitedForm: React.FC<
  SInputNumberLimitedFormProps
> = ({ min, max, ...props }) => {
  const maskWithLimits = createMaskOnlyNumberWithLimits({ min, max });

  return (
    <SInputForm {...props} type="number" transformation={maskWithLimits} />
  );
};
