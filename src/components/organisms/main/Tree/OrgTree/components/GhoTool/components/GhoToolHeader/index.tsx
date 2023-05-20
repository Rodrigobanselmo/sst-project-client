/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect } from 'react';

import SFlex from 'components/atoms/SFlex';
import {
  selectGhoSearch,
  setGhoSearch,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { GhoSearchInput } from '../GhoSearchInput';
import { GhoHeaderProps } from './types';

export const GhoToolHeader: FC<{ children?: any } & GhoHeaderProps> = ({
  handleSelectGHO,
  handleEditGHO,
  handleAddGHO,
  isAddLoading,
  inputRef,
  filter,
}) => {
  const dispatch = useAppDispatch();
  const searchSelected = useAppSelector(selectGhoSearch);

  const onSearch = (value: string) => {
    dispatch(setGhoSearch(value));
  };

  useEffect(() => {
    if (inputRef.current && inputRef.current)
      inputRef.current.value = searchSelected;
  }, [inputRef, searchSelected]);

  return (
    <SFlex align="center" gap={4} mb={5}>
      <GhoSearchInput
        ref={inputRef}
        handleSelectGHO={handleSelectGHO}
        onSearch={onSearch}
        handleEditGHO={handleEditGHO}
        handleAddGHO={!filter ? handleAddGHO : undefined}
        isAddLoading={isAddLoading}
      />
    </SFlex>
  );
};
