import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { ReactNode, useEffect } from 'react';
import { STableFilterChip } from '../STableFilterChip/STableFilterChip';
import { STableCleanChip } from '../STableFilterChip/STableCleanChip';
import {
  TablesSelectEnum,
  useTableSelect,
} from '../../../hooks/useTableSelect';
import { STableSelectionItems } from './components/STableSelectionItems';
import { SText } from '@v2/components/atoms/SText/SText';
import { Box } from '@mui/material';
import { STableButtonDivider } from '../STableSearch/components/STableButtonDivider/STableButtonDivider';

export interface STableSelectionProps {
  children: ReactNode;
  table: TablesSelectEnum;
}

export const STableSelection = ({ children, table }: STableSelectionProps) => {
  useTableSelect((state) => state.versions[table]);
  const selectedIds = useTableSelect((state) => state.getIds)(table)();
  const clear = useTableSelect((state) => state.clear)(table);

  useEffect(() => {
    return () => clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedIds || !selectedIds.length) return null;

  return (
    <SFlex
      gap={4}
      mb={2}
      flexWrap={'wrap'}
      bgcolor={'background.paper'}
      borderRadius={1}
      align="center"
      px={6}
      py={6}
    >
      <STableSelectionItems
        selectedNumber={selectedIds.length}
        onClick={clear}
      />
      <STableButtonDivider />

      {children}
    </SFlex>
  );
};
