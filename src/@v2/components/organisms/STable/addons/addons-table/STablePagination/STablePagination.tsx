import {
  Box,
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Skeleton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

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
  endSlot,
  pageSizeOptions,
  onPageSizeChange,
}: STableLoadMoreProps) => {
  const isMobile = !useMediaQuery('(min-width:600px)');

  const builtInPageSize =
    !!pageSizeOptions?.length &&
    !!onPageSizeChange &&
    limit != null &&
    Number.isFinite(limit);

  const pageSizeSlot = endSlot ? (
    endSlot
  ) : builtInPageSize ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexShrink: 0,
      }}
    >
      <Typography variant="body2" color="text.secondary" component="span">
        Mostrar:
      </Typography>
      <FormControl size="small" variant="outlined" sx={{ minWidth: 72 }}>
        <Select
          value={limit}
          onChange={(e: SelectChangeEvent<number>) => {
            onPageSizeChange(Number(e.target.value));
          }}
          displayEmpty
        >
          {pageSizeOptions!.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  ) : null;

  return (
    <StyledPaginationWrapper mt={mt}>
      {!isLoading && (
        <>
          <PageCounter count={total} />
          {pageSizeSlot}
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
                  maxWidth: '18px',
                  minWidth: '18px',
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
            width={'120px'}
            height={36}
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
