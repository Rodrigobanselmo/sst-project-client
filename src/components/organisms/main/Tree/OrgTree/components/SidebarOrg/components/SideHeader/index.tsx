/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { headerRows } from '../../utils/header.constants';
import { ViewTypeEnum } from '../../utils/view-type.enum';
import { SideInput } from '../SIdeInput';
import { SideRowTableMulti } from '../SideRowTable/Multiple';
import { STGridHeader } from './styles';
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
  return (
    <SFlex align="center" gap={4} mb={5}>
      {viewType === ViewTypeEnum.LIST && (
        <SideInput
          ref={inputRef}
          handleSelectGHO={handleSelectGHO}
          handleEditGHO={handleEditGHO}
          handleAddGHO={handleAddGHO}
          isAddLoading={isAddLoading}
        />
      )}
      <Box width="100%">
        {riskInit && (
          <STGridHeader
            style={
              viewType === ViewTypeEnum.SELECT
                ? {
                    gridTemplateColumns:
                      'minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) 120px 120px minmax(100px, 1fr) 120px 120px 120px',
                  }
                : {}
            }
          >
            {headerRows.map((row) => (
              <STooltip key={row.label} title={row.tooltip}>
                <SFlex center sx={{ position: 'relative' }}>
                  <SText noBreak={1}>{row.label}</SText>
                  {/* <StyledSInfoIcon /> */}
                </SFlex>
              </STooltip>
            ))}
          </STGridHeader>
        )}
        {viewType === ViewTypeEnum.SELECT && <SideRowTableMulti />}
      </Box>
    </SFlex>
  );
};
