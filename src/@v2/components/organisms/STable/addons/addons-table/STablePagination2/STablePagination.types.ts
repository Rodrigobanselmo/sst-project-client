import { BoxProps } from '@mui/material';

/* eslint-disable @typescript-eslint/ban-types */
export type STablePaginationProps = BoxProps & {
  totalCountOfRegisters?: number;
  registersPerPage?: number;
  currentPage?: number;
  onPageChange: (page: number) => void;
};
