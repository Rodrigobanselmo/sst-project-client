import React, { FC, useMemo } from 'react';

import {
  selectGhoFilter,
  selectGhoId,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';

import { GhoRow } from '../GhoRow';
import { RiskToolRiskViewProps } from './types';

export const GhoToolView: FC<RiskToolRiskViewProps> = ({
  handleDeleteGHO,
  handleEditGHO,
  handleSelectGHO,
  isDeleteLoading,
}) => {
  const { data: ghoQuery } = useQueryGHO();
  const selectedGhoId = useAppSelector(selectGhoId);
  const selectedGhoFilter = useAppSelector(selectGhoFilter);

  const ghoOrderedData = useMemo(() => {
    if (!ghoQuery) return [];
    const ghoFilter = ghoQuery.filter((gho) => !gho.type);
    if (!selectedGhoFilter.value || !selectedGhoFilter.key) return ghoFilter;
    return ghoFilter;
  }, [ghoQuery, selectedGhoFilter.key, selectedGhoFilter.value]);

  return (
    <>
      {ghoOrderedData.map((gho, index) => (
        <GhoRow
          key={gho.id}
          gho={gho}
          handleEditGHO={handleEditGHO}
          handleSelectGHO={handleSelectGHO}
          handleDeleteGHO={handleDeleteGHO}
          selectedGhoId={selectedGhoId}
          isDeleteLoading={isDeleteLoading}
          isFirst={index === 0}
        />
      ))}
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
