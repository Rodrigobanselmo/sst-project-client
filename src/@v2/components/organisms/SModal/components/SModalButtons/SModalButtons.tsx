import { BoxProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { FC, ReactNode } from 'react';

export const SModalButtons: FC<BoxProps> = ({ children, ...props }) => {
  return (
    <SFlex gap={4} flex={1} justify="flex-end" mt={16} {...props}>
      {children}
    </SFlex>
  );
};
