import React, { FC, useEffect, useMemo, useState } from 'react';

import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import PaginationItem from './PaginationItem';
import { STablePaginationProps } from './types';

const siblingsCount = 3;

function generatePagesArray(from: number, to: number): number[] {
  return [...new Array(to - from)]
    .map((_, index) => {
      return from + index + 1;
    })
    .filter((page) => page > 0);
}

const STablePagination: FC<{ children?: any } & STablePaginationProps> = ({
  onPageChange,
  totalCountOfRegisters,
  currentPage = 1,
  registersPerPage = 10,
  pageSizeOptions,
  onRegistersPerPageChange,
  ...props
}) => {
  const [count, setCount] = useState(totalCountOfRegisters || 0);

  useEffect(() => {
    if (typeof totalCountOfRegisters === 'number') {
      setCount(totalCountOfRegisters);
    }
  }, [totalCountOfRegisters]);

  const lastPage = useMemo(() => {
    return Math.ceil((count || 0) / registersPerPage);
  }, [registersPerPage, count]);

  const previousPage = useMemo(() => {
    return currentPage > 1
      ? generatePagesArray(currentPage - 1 - siblingsCount, currentPage - 1)
      : [];
  }, [currentPage]);

  const nextPages = useMemo(() => {
    return currentPage < lastPage
      ? generatePagesArray(
          currentPage,
          Math.min(currentPage + siblingsCount, lastPage),
        )
      : [];
  }, [currentPage, lastPage]);

  return (
    <SFlex
      direction={['column', 'row']}
      gap={6}
      mt={8}
      justify="space-between"
      align="center"
      {...props}
    >
      <Box>
        <SText fontSize={14}>
          {registersPerPage * (currentPage - 1)} -{' '}
          {registersPerPage * currentPage > (count || 0)
            ? count
            : registersPerPage * currentPage}{' '}
          de {count}
        </SText>
      </Box>

      {pageSizeOptions?.length && onRegistersPerPageChange ? (
        <SFlex align="center" gap={2} flexShrink={0}>
          <Typography variant="body2" color="text.secondary" fontSize={14}>
            Mostrar:
          </Typography>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 72 }}>
            <Select
              value={registersPerPage}
              onChange={(e: SelectChangeEvent<number>) => {
                onRegistersPerPageChange(Number(e.target.value));
              }}
            >
              {pageSizeOptions.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SFlex>
      ) : null}

      <SFlex direction="row" gap={2}>
        {currentPage > 1 + siblingsCount && (
          <>
            <PaginationItem pageNumber={1} onPageChange={onPageChange} />
            {currentPage > 2 + siblingsCount && (
              <SText color="gray.800" width={8} textAlign="center">
                ...
              </SText>
            )}
          </>
        )}

        {previousPage.length > 0 &&
          previousPage.map((page) => {
            return (
              <PaginationItem
                key={page}
                pageNumber={page}
                onPageChange={onPageChange}
              />
            );
          })}

        <PaginationItem
          pageNumber={currentPage}
          onPageChange={onPageChange}
          isCurrent
        />

        {nextPages.length > 0 &&
          nextPages.map((page) => {
            return (
              <PaginationItem
                key={page}
                pageNumber={page}
                onPageChange={onPageChange}
              />
            );
          })}

        {currentPage + siblingsCount < lastPage && (
          <>
            {currentPage + 1 + siblingsCount < lastPage && (
              <SText color="gray.800" width="8" textAlign="center">
                ...
              </SText>
            )}
            <PaginationItem pageNumber={lastPage} onPageChange={onPageChange} />
          </>
        )}
      </SFlex>
    </SFlex>
  );
};

export default STablePagination;
