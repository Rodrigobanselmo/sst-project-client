import { FC, ReactNode, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';

import SFlex from '@v2/components/atoms/SFlex/SFlex';
import SText from '@v2/components/atoms/SText/SText';
import { SPaginationItem } from './components/PaginationItem/SPaginationItem';
import { STablePaginationProps } from './STablePagination.types';
import { generatePagesArray } from './utils/generate-pages-array';

const siblingsCount = 3;

const usePagination = ({
  onPageChange,
  totalCountOfRegisters,
  currentPage = 1,
  registersPerPage = 10,
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
      mt={2}
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

      <SFlex direction="row" gap={2}>
        {currentPage > 1 + siblingsCount && (
          <>
            <SPaginationItem pageNumber={1} onPageChange={onPageChange} />
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
              <SPaginationItem
                key={page}
                pageNumber={page}
                onPageChange={onPageChange}
              />
            );
          })}

        <SPaginationItem
          pageNumber={currentPage}
          onPageChange={onPageChange}
          isCurrent
        />

        {nextPages.length > 0 &&
          nextPages.map((page) => {
            return (
              <SPaginationItem
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
            <SPaginationItem
              pageNumber={lastPage}
              onPageChange={onPageChange}
            />
          </>
        )}
      </SFlex>
    </SFlex>
  );
};

export default STablePagination;
