import {
  Pagination,
  PaginationItem,
  Skeleton,
  useMediaQuery,
} from '@mui/material';

import { PageCounter } from './components/PageCounter/PageCounter';
import { StyledPaginationWrapper } from './STablePagination.styles';
import { STableLoadMoreProps } from './STablePagination.types';

export const STablePagination = ({
  total = 0,
  limit = 10,
  page = 1,
  setPage,
  mt = 4,
  isLoading,
}: STableLoadMoreProps) => {
  const isMobile = !useMediaQuery('(min-width:600px)');

  return (
    <StyledPaginationWrapper mt={mt}>
      {!isLoading && (
        <>
          <PageCounter count={total} />
          <Pagination
            count={Math.ceil(total / limit)}
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
        </>
      )}
      {isLoading && (
        <>
          <Skeleton
            variant="rectangular"
            width={'100px'}
            height={20}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={'300px'}
            height={20}
            sx={{ borderRadius: 1 }}
          />
        </>
      )}
    </StyledPaginationWrapper>
  );
};
