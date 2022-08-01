/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';
import { useDebouncedCallback } from 'use-debounce';

import { hierarchyList } from 'core/constants/maps/hierarchy.constant';
import { useAppDispatch } from 'core/hooks/useAppDispatch';

import { initialHierarchySelectState } from '../..';
import { STSInput } from './styles';
import { SideInputProps } from './types';

// eslint-disable-next-line react/display-name
export const ModalInputHierarchy = React.forwardRef<
  any,
  SideInputProps & {
    selectedData: typeof initialHierarchySelectState;
  }
>(
  (
    {
      isAddLoading,
      onSelectAll,
      onSearch,
      setFilter,
      filter,
      small,
      listFilter,
      selectedData,
      onEmployeeAdd,
      ...props
    },
    ref,
  ) => {
    const handleSearch = useDebouncedCallback((value: string) => {
      onSearch?.(value);
    }, 300);
    const dispatch = useAppDispatch();

    return (
      <SFlex align="center" gap={10}>
        <STSInput
          small={small ? 1 : 0}
          loading={isAddLoading}
          size="small"
          variant="outlined"
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={'Pesquisar por GSE...'}
          subVariant="search"
          inputRef={ref}
          fullWidth
          {...props}
        />
        <SFlex gap={4} align="center">
          {hierarchyList
            .filter(
              (hierarchy) =>
                listFilter[hierarchy.value] &&
                selectedData.selectionHierarchy.includes(hierarchy.value),
            )
            .map((hierarchy) => (
              <STagButton
                active={filter === hierarchy.value}
                key={hierarchy.value}
                tooltipTitle={`filtar por ${hierarchy.name}`}
                text={hierarchy.name}
                large
                onClick={() => {
                  dispatch(setHierarchySearch(''));
                  setFilter(hierarchy.value);
                }}
              />
            ))}
          {selectedData.selectByGHO && (
            <STagButton
              active={filter === 'GHO'}
              tooltipTitle={'filtar por GSE'}
              text={'GSE'}
              large
              onClick={() => {
                dispatch(setHierarchySearch(''));
                setFilter('GHO');
              }}
            />
          )}
          {selectedData.addSubOffice && onEmployeeAdd && (
            <STagButton
              tooltipTitle={'Criar cargo desenvolvido'}
              text={'Empregados'}
              large
              onClick={() => {
                onEmployeeAdd?.();
              }}
            />
          )}
        </SFlex>
        <STagButton
          ml="auto"
          mr={10}
          text={'selecionar todos'}
          large
          onClick={() => onSelectAll?.()}
        />
      </SFlex>
    );
  },
);
