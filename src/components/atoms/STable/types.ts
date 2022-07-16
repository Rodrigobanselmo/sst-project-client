import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

export interface STableProps extends BoxProps {
  columns: string;
  rowGap?: string;
  rowsNumber?: number;
  loading?: boolean;
}

export interface STableBodyProps<T> extends BoxProps {
  renderRow: (row: T, index: number) => ReactNode;
  rowsData: T[];
  rowsInitialNumber?: number;
  numberRowsToLoadMore?: number;
  hideLoadMore?: boolean;
}
