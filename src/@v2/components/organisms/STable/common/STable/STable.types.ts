import { BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export interface ITableData<T> {
  column: string;
  hidden?: boolean;
  header: React.ReactNode;
  row: (row: T) => React.ReactNode;
}

export interface STableProps<T> {
  limit?: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  rowGap?: string;
  data: T[];
  renderHeader: (header: ReactNode[]) => ReactNode;
  renderBody: (props: {
    data: T[];
    rows: ((row: T) => ReactNode)[];
  }) => ReactNode;
  table: ITableData<T>[];
}
