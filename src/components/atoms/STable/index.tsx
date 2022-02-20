/* eslint-disable react/no-children-prop */
import React, { FC, useMemo, useState } from 'react';

import { Box, BoxProps } from '@mui/material';

import STableEmpty from './components/STableEmpty';
import STableLoading from './components/STableLoading';
import STableLoadMore from './components/STableLoadMore';
import {
  STSTable,
  STSTableHeader,
  STSTableBody,
  STSTableRow,
  STSTableHRow,
} from './styles';
import { STableProps, STableBodyProps } from './types';

export const STable: FC<STableProps> = ({
  rowGap = '10px',
  columns,
  loading,
  children,
  ...props
}) => (
  <Box position="relative">
    <STSTable
      rowGap={rowGap}
      columns={columns}
      children={loading ? null : children}
      pb={5}
      {...props}
    />
    {loading && <STableLoading rowGap={rowGap} />}
  </Box>
);

export const STableHeader: FC<BoxProps> = ({ className, ...props }) => (
  <STSTableHeader
    px={6}
    py={4}
    mb={2}
    className={'table_grid ' + className}
    {...props}
  />
);

export function STableBody<T>({
  renderRow,
  rowsData,
  rowsInitialNumber = 8,
  numberRowsToLoadMore = 100,
  ...props
}: STableBodyProps<T>) {
  const [numberRows, setNumberRows] = useState(rowsInitialNumber);

  const handelMoreRows = () => {
    setNumberRows(numberRows + numberRowsToLoadMore);
  };

  const rows = useMemo(() => {
    return rowsData.slice(0, numberRows);
  }, [numberRows, rowsData]);

  return (
    <>
      <STSTableBody gap={5} {...props}>
        {rows.map((row, index) => renderRow(row, index))}
      </STSTableBody>
      {rows.length === 0 && <STableEmpty />}
      <STableLoadMore
        actualRows={rows.length}
        totalRows={rowsData.length}
        onClick={handelMoreRows}
      />
    </>
  );
}

export const STableRow: FC<BoxProps> = ({ className, ...props }) => (
  <STSTableRow px={6} py={4} className={'table_grid ' + className} {...props} />
);

export const STableHRow: FC<BoxProps> = ({ ...props }) => (
  <STSTableHRow {...props} />
);