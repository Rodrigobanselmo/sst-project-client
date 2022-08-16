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

import { useRowColumns } from '../../../hooks/useRowColumns';
import { IColumnOption } from '../../../utils/header.constants';
import { ViewTypeEnum } from '../../../utils/view-risk-type.constant';
import { STGridHeader, StyledSArrowUpFilterIcon } from '../styles';
import { SideHeaderProps as RiskToolProps } from '../types';

export const RiskToolColumns: FC<Partial<RiskToolProps>> = ({ viewType }) => {
  const dispatch = useAppDispatch();
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const { columns } = useRowColumns();

  const handleSetFilters = (row: IColumnOption) => () => {
    if (row.filterKey && row.filterValues)
      dispatch(
        setGhoFilterValues({
          key: row.filterKey,
          values: row.filterValues,
        }),
      );
  };

  return (
    <STGridHeader
      sx={{ gridTemplateColumns: columns.map((row) => row.grid).join(' ') }}
    >
      {columns.map((column) => {
        const isFilterSelected = selectedGhoFilter.key === column.filterKey;
        const isSortable =
          column.filterKey &&
          viewType &&
          [ViewTypeEnum.SIMPLE_BY_RISK, ViewTypeEnum.SIMPLE_BY_GROUP].includes(
            viewType,
          );

        return (
          <STooltip key={column.label} title={column.tooltip}>
            <SFlex
              onClick={isSortable ? handleSetFilters(column) : undefined}
              center
              sx={{
                position: 'relative',
                userSelect: 'none',
                cursor: isSortable ? 'pointer' : 'default',
              }}
            >
              <SText noBreak>{column.label}</SText>
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
