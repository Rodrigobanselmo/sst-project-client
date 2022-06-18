/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import {
  selectGhoFilter,
  setGhoFilterValues,
  setGhoSearch,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { headerRows } from '../../utils/header.constants';
import { ViewTypeEnum } from '../../utils/view-type.constant';
import { SideInput } from '../SIdeInput';
import { SideRowTableMulti } from '../SideRowTable/Multiple';
import { STGridHeader, StyledSArrowUpFilterIcon } from './styles';
import { SideHeaderProps } from './types';

export const SideHeader: FC<SideHeaderProps> = ({
  handleSelectGHO,
  handleEditGHO,
  handleAddGHO,
  isAddLoading,
  inputRef,
  riskInit,
  viewType,
}) => {
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
    <SFlex align="center" gap={4} mb={5}>
      {viewType === ViewTypeEnum.SIMPLE_BY_RISK && (
        <SideInput
          ref={inputRef}
          handleSelectGHO={handleSelectGHO}
          onSearch={(value) => dispatch(setGhoSearch(value))}
          handleEditGHO={handleEditGHO}
          handleAddGHO={handleAddGHO}
          isAddLoading={isAddLoading}
        />
      )}
      <Box width="100%">
        {riskInit && (
          <STGridHeader>
            {headerRows.map((row) => {
              const isFilterSelected = selectedGhoFilter.key === row.filterKey;
              const isSortable =
                row.filterKey && viewType === ViewTypeEnum.SIMPLE_BY_RISK;
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
                        filter={
                          isFilterSelected ? selectedGhoFilter.value || '' : ''
                        }
                      />
                    )}
                  </SFlex>
                </STooltip>
              );
            })}
          </STGridHeader>
        )}
        {viewType === ViewTypeEnum.MULTIPLE && <SideRowTableMulti />}
      </Box>
    </SFlex>
  );
};
