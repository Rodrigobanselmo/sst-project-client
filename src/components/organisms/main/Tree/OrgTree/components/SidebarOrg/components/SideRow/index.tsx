/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';

import { SideItems } from './components/SideItems';
import { SideTable } from './components/SideTable';
import { SideRowProps } from './types';

export const SideRow = React.memo<SideRowProps>(
  ({
    handleDeleteGHO,
    handleSelectGHO,
    handleEditGHO,
    selectedGhoId,
    gho,
    isRiskOpen,
    isDeleteLoading,
    riskData,
  }) => {
    const isSelected = selectedGhoId === gho.id;
    return (
      <SFlex
        key={gho.id}
        sx={{
          gridTemplateColumns: '285px 1fr',
          display: 'grid',
        }}
        gap={5}
      >
        <SideItems
          data={gho}
          isSelected={isSelected}
          handleEditGHO={handleEditGHO}
          handleSelectGHO={handleSelectGHO}
          handleDeleteGHO={handleDeleteGHO}
          isDeleteLoading={isDeleteLoading}
        />
        {isRiskOpen && (
          <SideTable isSelected={isSelected} gho={gho} riskData={riskData} />
        )}
      </SFlex>
    );
  },
);
