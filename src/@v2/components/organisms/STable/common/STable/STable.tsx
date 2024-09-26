import { Box } from '@mui/material';

import { STSTable } from './STable.styles';
import { STableProps } from './STable.types';
import { STableLoading } from '../../addons/addons-table/STableLoading/STableLoading';

export const STable: React.FC<React.PropsWithChildren<STableProps>> = ({
  rowGap = '10px',
  columns,
  loading,
  children,
  rowsNumber,
  ...props
}) => (
  <Box position="relative">
    <STSTable
      rowGap={rowGap}
      columns={columns.join(' ')}
      children={loading ? null : children}
      pb={5}
      {...props}
    />
    {loading && (
      <STableLoading minWidth={800} rowGap={rowGap} rowsNumber={rowsNumber} />
    )}
  </Box>
);
