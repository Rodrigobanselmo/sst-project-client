/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';

import { GhoSearchInput } from '../GhoSearchInput';
import { GhoHeaderProps } from './types';

export const GhoToolTreeFilter: FC<{ children?: any } & GhoHeaderProps> = ({
  isAddLoading,
  inputRef,
}) => {
  const dispatch = useAppDispatch();
  const { searchFilterNodes } = useHierarchyTreeActions();

  const onSearch = (value: string) => {
    searchFilterNodes(value);
    dispatch(setHierarchySearch(value));
  };

  return (
    <SFlex align="center" gap={4} mb={5}>
      <GhoSearchInput
        debounceTime={1000}
        ref={inputRef}
        onSearch={onSearch}
        isAddLoading={isAddLoading}
        placeholder="filtrar cargos por nome"
      />
    </SFlex>
  );
};
