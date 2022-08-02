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
  rowsNumber,
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
    {loading && (
      <STableLoading minWidth={800} rowGap={rowGap} rowsNumber={rowsNumber} />
    )}
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
  numberRowsToLoadMore = 8,
  hideLoadMore,
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
      {!hideLoadMore && (
        <STableLoadMore
          actualRows={rows.length}
          totalRows={rowsData.length}
          onClick={handelMoreRows}
        />
      )}
    </>
  );
}

export const STableRow: FC<BoxProps & { clickable?: boolean }> = ({
  className,
  clickable,
  ...props
}) => (
  <STSTableRow
    clickable={clickable ? 1 : 0}
    px={6}
    py={2}
    className={'table_grid ' + className}
    {...props}
  />
);

export const STableHRow: FC<BoxProps> = ({ ...props }) => (
  <STSTableHRow fontSize={13} {...props} />
);
