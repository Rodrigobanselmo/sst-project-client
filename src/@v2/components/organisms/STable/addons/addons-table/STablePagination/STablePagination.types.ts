import { ReactNode } from 'react';

export interface STableLoadMoreProps {
  total?: number;
  limit?: number;
  page?: number;
  isLoading?: boolean;
  setPage: (page: number) => void;
  mt?: number | number[];
  /** Custom content between total counter and page buttons (e.g. page size select). */
  endSlot?: ReactNode;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}
