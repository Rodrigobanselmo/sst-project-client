import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { ReactNode } from 'react';
import { STableFilterChip } from '../STableFilterChip/STableFilterChip';
import { STableCleanChip } from '../STableFilterChip/STableCleanChip';

export interface STableFilterChipListProps {
  children: ReactNode;
  onClean: () => void;
}

export const STableFilterChipList = ({
  children,
  onClean,
}: STableFilterChipListProps) => {
  if (Array.isArray(children) && !children?.length) return null;

  return (
    <SFlex gap={4} mb={2} flexWrap={'wrap'}>
      {children}
      <STableCleanChip onClick={onClean} />
    </SFlex>
  );
};
