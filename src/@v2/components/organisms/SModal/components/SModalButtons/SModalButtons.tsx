import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { FC, ReactNode } from 'react';

export const SModalButtons: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <SFlex gap={4} flex={1} justify="flex-end" mt={8}>
      {children}
    </SFlex>
  );
};
