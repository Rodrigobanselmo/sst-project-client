/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';
import { useDebouncedCallback } from 'use-debounce';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';

import { STSInput } from './styles';
import { GhoHeaderProps } from './types';

export const HierarchyFilter: FC<GhoHeaderProps> = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((s) => s.hierarchy.search);
  const { searchFilterNodes } = useHierarchyTreeActions();
  const handleSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 1000);

  const onSearch = (value: string) => {
    searchFilterNodes(value);
    dispatch(setHierarchySearch(value));
  };

  return (
    <SFlex align="center" gap={4} ml={13} mt={10}>
      <STSInput
        size="small"
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={'Pesquisar por cargo...'}
        subVariant="search"
        fullWidth
        value={search}
      />
    </SFlex>
  );
};
