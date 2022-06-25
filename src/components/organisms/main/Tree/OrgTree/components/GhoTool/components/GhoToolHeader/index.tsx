/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { setGhoSearch } from 'store/reducers/hierarchy/ghoSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';

import { GhoSearchInput } from '../GhoSearchInput';
import { GhoHeaderProps } from './types';

export const GhoToolHeader: FC<GhoHeaderProps> = ({
  handleSelectGHO,
  handleEditGHO,
  handleAddGHO,
  isAddLoading,
  inputRef,
}) => {
  const dispatch = useAppDispatch();

  return (
    <SFlex align="center" gap={4} mb={5}>
      <GhoSearchInput
        ref={inputRef}
        handleSelectGHO={handleSelectGHO}
        onSearch={(value) => dispatch(setGhoSearch(value))}
        handleEditGHO={handleEditGHO}
        handleAddGHO={handleAddGHO}
        isAddLoading={isAddLoading}
      />
    </SFlex>
  );
};
