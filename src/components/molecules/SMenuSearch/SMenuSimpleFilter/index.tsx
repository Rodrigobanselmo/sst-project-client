import { FC, memo } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';

import { SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX } from './smenu-simple-filter-compact.styles';
import { SMenuSimpleFilterSearchProps } from './types';

const MenuFilter: FC<{ children?: any } & SMenuSimpleFilterSearchProps> = ({
  options,
  activeFilters,
  onClickFilter,
  compact,
}) => {
  return (
    <SFlex
      sx={{
        gap: compact ? 2 : 3,
        ml: 6,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {options.map((option) => {
        const isActive = activeFilters.includes(option.filter);
        return (
          <STooltip
            title={
              compact
                ? option.label
                : `filtrar por riscos ${option.filter}`
            }
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
                color: isActive
                  ? option.activeTextColor || 'common.white'
                  : option.inactiveTextColor || 'common.white',
                ...(compact ? SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX : null),
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
