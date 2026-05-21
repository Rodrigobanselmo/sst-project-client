import { FC, MouseEvent, memo } from 'react';

import { Box } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { IMenuFilterOptions } from 'components/molecules/SMenuSearch/SMenuSimpleFilter/types';

type RiskSelectFilterBarProps = {
  mainRow: IMenuFilterOptions[];
  ergonomicRow: IMenuFilterOptions[];
  activeFilters: string[];
  onClickFilter: (filter: string, e: MouseEvent<HTMLDivElement>) => void;
};

const FilterPill: FC<{
  option: IMenuFilterOptions;
  isActive: boolean;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}> = ({ option, isActive, onClick }) => (
  <STooltip title={`Filtrar por ${option.label}`}>
    <Box
      component="button"
      type="button"
      onClick={onClick}
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
      }}
    >
      {option.label}
    </Box>
  </STooltip>
);

export const RiskSelectFilterBar: FC<RiskSelectFilterBarProps> = memo(
  ({ mainRow, ergonomicRow, activeFilters, onClickFilter }) => (
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
            isActive={activeFilters.includes(option.filter)}
            onClick={(e) => onClickFilter(option.filter, e)}
          />
        ))}
      </Box>
    </Box>
  ),
);

RiskSelectFilterBar.displayName = 'RiskSelectFilterBar';
