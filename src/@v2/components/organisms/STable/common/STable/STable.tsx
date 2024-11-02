import { Box } from '@mui/material';

import { STSTable } from './STable.styles';
import { STableProps } from './STable.types';
import { STableLoading } from '../../addons/addons-table/STableLoading/STableLoading';
import { useMemo } from 'react';

export function STable<T>({
  rowGap = '10px',
  isLoading,
  isLoadingMore,
  data,
  table,
  renderHeader,
  renderBody,
}: React.PropsWithChildren<STableProps<T>>) {
  const { columns, headers, rows } = useMemo(() => {
    const tables = table.filter(({ hidden }) => !hidden);

    return {
      columns: tables.map(({ column }) => column),
      headers: tables.map(({ header }) => header),
      rows: tables.map(({ row }) => row),
    };
  }, [table]);

  return (
    <Box position="relative">
      {!isLoading && (
        <STSTable rowGap={rowGap} columns={columns.join(' ')}>
          {renderHeader(headers)}
          {!isLoadingMore && renderBody({ data, rows })}
        </STSTable>
      )}
      {(isLoading || isLoadingMore) && (
        <STableLoading onlyRows={isLoadingMore} table={table} rowGap={rowGap} />
      )}
    </Box>
  );
}
