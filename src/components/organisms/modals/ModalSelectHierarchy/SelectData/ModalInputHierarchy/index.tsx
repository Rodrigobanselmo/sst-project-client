/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';
import { useDebouncedCallback } from 'use-debounce';

import { hierarchyList } from 'core/constants/maps/hierarchy.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import {
  STRUCTURE_COVERAGE_TOOLTIP,
  STRUCTURE_FILTER,
} from '../../structure-hierarchy-selection.util';

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
      <SFlex align="center" gap={10} mb={7}>
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
          {(selectedData.gseCargoSelect ||
            selectedData.characterizationCargoSelect) && (
            <STagButton
              active={filter === STRUCTURE_FILTER}
              tooltipTitle={STRUCTURE_COVERAGE_TOOLTIP}
              text="Estrutura"
              large
              onClick={() => {
                dispatch(setHierarchySearch(''));
                setFilter(STRUCTURE_FILTER);
              }}
            />
          )}
          {hierarchyList
            .filter((hierarchy) => {
              if (
                selectedData.gseCargoSelect ||
                selectedData.characterizationCargoSelect
              ) {
                return hierarchy.value === HierarchyEnum.OFFICE;
              }
              return (
                listFilter[hierarchy.value] &&
                selectedData.selectionHierarchy.includes(hierarchy.value)
              );
            })
            .map((hierarchy) => (
              <STagButton
                active={filter === hierarchy.value}
                key={hierarchy.value}
                tooltipTitle={`filtar por ${hierarchy.name}`}
                text={
                  hierarchy.name.slice(0, 9) +
                  (hierarchy.name.length > 9 ? '..' : '')
                }
                large
                onClick={() => {
                  dispatch(setHierarchySearch(''));
                  setFilter(hierarchy.value);
                }}
              />
            ))}
          {selectedData.selectByGHO && !selectedData.forceCargoFilter && (
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
              text={'Funcionários'}
              large
              onClick={() => {
                onEmployeeAdd?.();
              }}
            />
          )}
        </SFlex>
        {/* <STagButton
          ml="auto"
          mr={10}
          text={'selecionar todos'}
          large
          onClick={() => onSelectAll?.()}
        /> */}
      </SFlex>
    );
  },
);
