/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { headerRows } from '../../utils/header.constants';
import { SideInput } from '../SIdeInput';
import { STGridHeader } from './styles';
import { SideHeaderProps } from './types';

export const SideHeader: FC<SideHeaderProps> = ({
  handleSelectGHO,
  handleEditGHO,
  handleAddGHO,
  isAddLoading,
  inputRef,
  riskInit,
}) => {
  return (
    <SFlex align="center" gap={4} mb={5}>
      <SideInput
        ref={inputRef}
        handleSelectGHO={handleSelectGHO}
        handleEditGHO={handleEditGHO}
        handleAddGHO={handleAddGHO}
        isAddLoading={isAddLoading}
      />
      {riskInit && (
        <STGridHeader>
          {headerRows.map((row) => (
            <STooltip key={row.label} title={row.tooltip}>
              <SFlex center sx={{ position: 'relative' }}>
                <SText lineNumber={1}>{row.label}</SText>
                {/* <StyledSInfoIcon /> */}
              </SFlex>
            </STooltip>
          ))}
        </STGridHeader>
      )}
    </SFlex>
  );
};
