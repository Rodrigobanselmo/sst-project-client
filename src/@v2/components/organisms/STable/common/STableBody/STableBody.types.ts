import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

export interface STableBodyProps<T> extends BoxProps {
  renderRow: (row: T, index: number) => ReactNode;
  rowsData: T[];
  rowsInitialNumber?: number;
  numberRowsToLoadMore?: number;
  hideLoadMore?: boolean;
  hideEmpty?: boolean;
  contentEmpty?: ReactNode;
}
