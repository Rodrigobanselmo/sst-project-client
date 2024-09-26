import {
  Pagination,
  PaginationItem,
  PaginationProps,
  useMediaQuery,
} from '@mui/material';

import { StyledPaginationWrapper } from './STablePagination.styles';
import { PageCounter } from './components/PageCounter/PageCounter';

export const CPagination = (
  props: PaginationProps & { totalCount?: number },
) => {
  const isMobile = !useMediaQuery('(min-width:600px)');

  return (
    <StyledPaginationWrapper>
      <PageCounter count={props.totalCount || 0} />
      <Pagination
        {...props}
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
