import { Box } from '@mui/material';

import { STSTable } from './STable.styles';
import { STableProps } from './STable.types';
import { STableLoading } from '../../addons/addons-table/STableLoading/STableLoading';
import { useMemo } from 'react';

export function STable<T>({
  rowGap = '10px',
  isLoading,
  data,
  table,
  renderHeader,
  renderBody,
}: React.PropsWithChildren<STableProps<T>>) {
  const { columns, headers, rows } = useMemo(() => {
    return {
      columns: table.map(({ column }) => column),
      headers: table.map(({ header }) => header),
      rows: table.map(({ row }) => row),
    };
  }, [table]);

  return (
    <Box position="relative">
      {!isLoading && (
        <STSTable rowGap={rowGap} columns={columns.join(' ')}>
          {renderHeader(headers)}
          {renderBody({ data, rows })}
        </STSTable>
      )}
      {isLoading && <STableLoading table={table} rowGap={rowGap} />}
    </Box>
  );
}
