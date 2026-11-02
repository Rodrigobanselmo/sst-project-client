import { useGseVisualAssistance } from '../../../GseVisualAssistance/GseVisualAssistance.context';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect } from 'react';

import SFlex from 'components/atoms/SFlex';
import {
  selectGhoSearch,
  setGhoSearch,
} from 'store/reducers/hierarchy/ghoSlice';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { GhoSearchInput } from '../GhoSearchInput';
import { GhoHeaderProps } from './types';

export const GhoToolHeader: FC<{ children?: any } & GhoHeaderProps> = ({
  handleSelectGHO,
  handleEditGHO,
  handleAddGHO,
  handleAddCharacterization,
  characterizationAddTooltip,
  isAddLoading,
  inputRef,
  filter,
}) => {
  const assisted = !!useGseVisualAssistance()?.active;
  const dispatch = useAppDispatch();
  const searchSelected = useAppSelector(selectGhoSearch);

  const onSearch = (value: string) => {
    dispatch(setGhoSearch(value));
  };

  useEffect(() => {
    if (inputRef.current && inputRef.current)
      inputRef.current.value = searchSelected;
  }, [inputRef, searchSelected]);

  const characterizationTooltip =
    characterizationAddTooltip ||
    (filter != null && originRiskMap[filter]
      ? `Adicionar ${originRiskMap[filter].name}`
      : 'Adicionar');

  return (
    <SFlex align="center" gap={4} mb={5}>
      <GhoSearchInput
        ref={inputRef}
        handleSelectGHO={handleSelectGHO}
        onSearch={onSearch}
        handleEditGHO={assisted ? undefined : handleEditGHO}
        handleAddGHO={!assisted && !filter ? handleAddGHO : undefined}
        handleAddCharacterization={
          !assisted && filter ? handleAddCharacterization : undefined
        }
        characterizationAddTooltip={characterizationTooltip}
        isAddLoading={isAddLoading}
      />
    </SFlex>
  );
};
