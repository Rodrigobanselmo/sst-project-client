import { FC, MouseEvent, memo } from 'react';

import { Box } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { IMenuFilterOptions } from 'components/molecules/SMenuSearch/SMenuSimpleFilter/types';

type RiskSelectFilterBarProps = {
  polished?: boolean;
  mainRow: IMenuFilterOptions[];
  ergonomicRow: IMenuFilterOptions[];
  activeFilters: string[];
  onClickFilter: (filter: string, e: MouseEvent<HTMLButtonElement>) => void;
};

const FilterPill: FC<{
  polished?: boolean;
  option: IMenuFilterOptions;
  isActive: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}> = ({ option, isActive, onClick, polished }) => (
  <STooltip title={`Filtrar por ${option.label}`}>
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      sx={{
        appearance: 'none',
        border: 'none',
        width: '100%',
        minHeight: 28,
        backgroundColor: isActive ? option.activeColor : 'grey.400',
        color: isActive
          ? option.activeTextColor || 'common.white'
          : 'common.white',
        borderRadius: 1,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.2,
        px: 0.5,
        py: 0.5,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease-in-out',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'center',
        ...(polished && {
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isActive ? option.activeColor : 'divider',
          backgroundColor: isActive ? option.activeColor : 'transparent',
          color: isActive
            ? option.activeTextColor || 'common.white'
            : 'text.secondary',
          '&:hover': { opacity: 0.85, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
        }),
      }}
    >
      {option.label}
    </Box>
  </STooltip>
);

export const RiskSelectFilterBar: FC<RiskSelectFilterBarProps> = memo(
  ({ mainRow, ergonomicRow, activeFilters, onClickFilter, polished }) => (
    <Box
      sx={{
        ml: 6,
        mr: 5,
        pb: 1,
        pt: 0.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: 'calc(100% - 48px)',
        maxWidth: 560,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${mainRow.length}, minmax(0, 1fr))`,
          gap: 4,
        }}
      >
        {mainRow.map((option) => (
          <FilterPill
            key={option.filter}
            option={option}
            polished={polished}
            isActive={activeFilters.includes(option.filter)}
            onClick={(e) => onClickFilter(option.filter, e)}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${ergonomicRow.length}, minmax(0, 1fr))`,
          gap: 4,
        }}
      >
        {ergonomicRow.map((option) => (
          <FilterPill
            key={option.filter}
            option={option}
            polished={polished}
            isActive={activeFilters.includes(option.filter)}
            onClick={(e) => onClickFilter(option.filter, e)}
          />
        ))}
      </Box>
    </Box>
  ),
);

RiskSelectFilterBar.displayName = 'RiskSelectFilterBar';
