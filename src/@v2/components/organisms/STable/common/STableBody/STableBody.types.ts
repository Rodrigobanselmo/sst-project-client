import { ReactNode } from 'react';

export interface STableBodyProps<T> {
  renderRow: (row: T, index: number) => ReactNode;
  rows: T[];
  hideEmpty?: boolean;
  contentEmpty?: ReactNode;
}
