import { FC, memo } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';

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
          <STooltip
            title={`filtrar por riscos ${option.filter}`}
            key={option.filter}
          >
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
                zIndex: 1,
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
          </STooltip>
        );
      })}
    </SFlex>
  );
};

export const SMenuSimpleFilter = memo(MenuFilter);
