import { BoxProps } from '@mui/material';

export type STablePaginationProps = BoxProps & {
  totalCountOfRegisters?: number;
  registersPerPage?: number;
  currentPage?: number;
  onPageChange: (page: number) => void;
};
