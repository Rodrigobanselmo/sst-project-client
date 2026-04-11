import { BoxProps, PaginationProps } from '@mui/material';
import { ReactNode } from 'react';

export interface STableLoadMoreProps {
  total?: number;
  limit?: number;
  page?: number;
  isLoading?: boolean;
  setPage: (page: number) => void;
  mt?: number | number[];
  /** Conteúdo entre o contador de total e a paginação (ex.: itens por página). */
  endSlot?: ReactNode;
}
