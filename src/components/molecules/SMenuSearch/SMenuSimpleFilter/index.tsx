import { FC, memo } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

import { SMenuSimpleFilterSearchProps } from './types';

const MenuFilter: FC<SMenuSimpleFilterSearchProps> = ({
  options,
  activeFilters,
  onClickFilter,
}) => {
  return (
    <SFlex
      sx={{
        gap: 3,
        ml: 6,
      }}
    >
      {options.map((option) => {
        const isActive = activeFilters.includes(option.filter);
        return (
          <Box
            key={option.filter}
            onClick={(e) => onClickFilter(option.filter, e)}
            sx={{
              backgroundColor: isActive
                ? option?.activeColor || 'primary.light'
                : 'grey.400',
              px: 4,
              py: '1px',
              borderRadius: 3,
              fontSize: '12px',
              mb: 1,
              mt: -1,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out',
              color: 'common.white',
            }}
          >
            {option.label}
          </Box>
        );
      })}
    </SFlex>
  );
};

export const SMenuSimpleFilter = memo(MenuFilter);
