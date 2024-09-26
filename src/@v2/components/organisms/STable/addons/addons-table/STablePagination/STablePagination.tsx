import {
  Pagination,
  PaginationItem,
  PaginationProps,
  useMediaQuery,
} from '@mui/material';

import { StyledPaginationWrapper } from './STablePagination.styles';
import { PageCounter } from './components/PageCounter/PageCounter';
import { STableLoadMoreProps } from './STablePagination.types';

export const STablePagination = ({
  total = 0,
  limit,
  page,
  setPage,
}: STableLoadMoreProps) => {
  const isMobile = !useMediaQuery('(min-width:600px)');

  return (
    <StyledPaginationWrapper>
      <PageCounter count={total} />
      <Pagination
        count={total / limit}
        page={page}
        onChange={(_, page) => setPage(page)}
        siblingCount={isMobile ? 0 : 1}
        color="primary"
        renderItem={(item) => (
          <PaginationItem
            {...item}
            sx={{
              '&&.MuiPaginationItem-root.Mui-selected': {
                backgroundColor: 'grey.400',
                color: 'text.primary',
              },
            }}
          />
        )}
      />
    </StyledPaginationWrapper>
  );
};
