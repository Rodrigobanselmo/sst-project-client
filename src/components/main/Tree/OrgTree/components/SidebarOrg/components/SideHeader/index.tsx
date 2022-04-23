/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { headerRows } from '../../constants/header.constants';
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
    <SFlex align="center" gap="1" mb={2}>
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
              <SFlex>
                <SText lineNumber={1}>{row.label}</SText>
              </SFlex>
            </STooltip>
          ))}
        </STGridHeader>
      )}
    </SFlex>
  );
};
