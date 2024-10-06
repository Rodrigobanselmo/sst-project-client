import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { ReactNode } from 'react';

export interface STableFilterChipListProps {
  children: ReactNode;
}

export const STableFilterChipList = ({
  children,
}: STableFilterChipListProps) => {
  if (Array.isArray(children) && !children?.length) return null;

  return (
    <SFlex gap={4} mb={2}>
      {children}
    </SFlex>
  );
};
