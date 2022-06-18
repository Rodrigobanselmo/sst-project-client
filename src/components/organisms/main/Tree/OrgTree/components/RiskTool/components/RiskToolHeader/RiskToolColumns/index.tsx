/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import {
  selectGhoFilter,
  setGhoFilterValues,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { headerRows } from '../../../utils/header.constants';
import { ViewTypeEnum } from '../../../utils/view-type.constant';
import { STGridHeader, StyledSArrowUpFilterIcon } from '../styles';
import { SideHeaderProps as RiskToolProps } from '../types';

export const RiskToolColumns: FC<Partial<RiskToolProps>> = ({ viewType }) => {
  const dispatch = useAppDispatch();
  const selectedGhoFilter = useAppSelector(selectGhoFilter);

  const handleSetFilters = (row: typeof headerRows[0]) => () => {
    if (row.filterKey && row.filterValues)
      dispatch(
        setGhoFilterValues({
          key: row.filterKey,
          values: row.filterValues,
        }),
      );
  };

  return (
    <STGridHeader>
      {headerRows.map((row) => {
        const isFilterSelected = selectedGhoFilter.key === row.filterKey;
        const isSortable =
          row.filterKey &&
          viewType &&
          [ViewTypeEnum.SIMPLE_BY_RISK, ViewTypeEnum.SIMPLE_BY_GROUP].includes(
            viewType,
          );
        return (
          <STooltip key={row.label} title={row.tooltip}>
            <SFlex
              onClick={isSortable ? handleSetFilters(row) : undefined}
              center
              sx={{
                position: 'relative',
                userSelect: 'none',
                cursor: isSortable ? 'pointer' : 'default',
              }}
            >
              <SText noBreak>{row.label}</SText>
              {isSortable && (
                <StyledSArrowUpFilterIcon
                  filter={isFilterSelected ? selectedGhoFilter.value || '' : ''}
                />
              )}
            </SFlex>
          </STooltip>
        );
      })}
    </STGridHeader>
  );
};
