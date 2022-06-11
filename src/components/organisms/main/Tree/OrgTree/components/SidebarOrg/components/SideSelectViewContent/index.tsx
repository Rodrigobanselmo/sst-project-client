/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useRef } from 'react';
import { useStore } from 'react-redux';

import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import {
  setGhoMultiAddIds,
  setGhoMultiDisabledAddIds,
  setGhoMultiDisabledRemoveIds,
  setGhoMultiRemoveIds,
} from 'store/reducers/hierarchy/ghoMultiSlice';
import {
  setGhoSearch,
  setGhoSearchSelect,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { StyledGridMultiGho } from '../../styles';
import { SideInput } from '../SIdeInput';
import { SideSelectedGho } from '../SideToSelectedGho/SideSelectedGho';
import { SideUnselectedGho } from '../SideToSelectedGho/SideUnselectedGho';
import { SaveButton } from './SaveButton';
import { SideSelectViewContentProps } from './types';

export const SideSelectViewContent: FC<SideSelectViewContentProps> = ({
  handleAddGHO,
  handleSelectGHO,
  handleEditGHO,
  ghoQuery,
  inputRef,
}) => {
  const dispatch = useAppDispatch();
  const inputSelectedRef = useRef<HTMLInputElement>(null);
  const store = useStore();

  const handleSelectAll = useCallback(() => {
    const search = store.getState().gho.search as string;
    const allToSelect = ghoQuery
      .filter((gho) =>
        stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputRef && inputRef.current) inputRef.current.value = '';
    dispatch(setGhoSearch(''));

    dispatch(setGhoMultiAddIds(allToSelect));
  }, [store, ghoQuery, inputRef, dispatch]);

  const handleUnselectAll = useCallback(() => {
    const search = store.getState().gho.searchSelect as string;
    const selectedIds = store.getState().ghoMulti.selectedIds as string;
    const allToSelect = ghoQuery
      .filter(
        (gho) =>
          selectedIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputSelectedRef.current) inputSelectedRef.current.value = '';
    dispatch(setGhoSearchSelect(''));

    dispatch(setGhoMultiRemoveIds(allToSelect));
  }, [ghoQuery, dispatch, store]);

  const handleInvertDisabled = useCallback(() => {
    const search = store.getState().gho.searchSelect as string;
    const selectedIds = store.getState().ghoMulti.selectedIds as string[];
    const selectedDisabledIds = store.getState().ghoMulti
      .selectedDisabledIds as string[];

    const allSelected = ghoQuery
      .filter(
        (gho) =>
          selectedIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    const allDisabledSelect = ghoQuery
      .filter(
        (gho) =>
          selectedDisabledIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputSelectedRef.current) inputSelectedRef.current.value = '';
    dispatch(setGhoSearchSelect(''));

    dispatch(setGhoMultiDisabledAddIds(allSelected));
    dispatch(setGhoMultiDisabledRemoveIds(allDisabledSelect));
  }, [ghoQuery, dispatch, store]);

  return (
    <>
      <SFlex mt={5} align="center">
        <SideInput
          ref={inputSelectedRef}
          onSearch={(value) => dispatch(setGhoSearchSelect(value))}
          handleSelectGHO={handleSelectGHO}
          handleEditGHO={handleEditGHO}
        />
        <SFlex align="center" sx={{ ml: 'auto', mr: 5 }}>
          <STagButton
            icon={SwapHorizIcon}
            text="Inverter desabiitados"
            large
            mr={5}
            tooltipTitle="Todos os items desabilitados seram ativadoes e vice-versa"
            onClick={handleInvertDisabled}
          />
          <STagButton
            icon={IndeterminateCheckBoxOutlinedIcon}
            tooltipTitle="Remover todos os GHOs abaixo"
            mr={5}
            large
            text="Remover todos"
            onClick={handleUnselectAll}
          />
          <SaveButton />
        </SFlex>
      </SFlex>
      <StyledGridMultiGho>
        {ghoQuery.map((gho) => (
          <SideSelectedGho key={gho.id} data={gho} />
        ))}
      </StyledGridMultiGho>
      <SFlex align="center">
        <SideInput
          ref={inputRef}
          onSearch={(value) => dispatch(setGhoSearch(value))}
          handleSelectGHO={handleSelectGHO}
          handleEditGHO={handleEditGHO}
          handleAddGHO={handleAddGHO}
        />
        <STagButton
          icon={LibraryAddCheckOutlinedIcon}
          tooltipTitle="Selecione todos os GHOs abaixo"
          sx={{ ml: 'auto', mr: 5 }}
          large
          text="Selecione todos"
          onClick={handleSelectAll}
        />
      </SFlex>
      <StyledGridMultiGho>
        {ghoQuery.map((gho) => (
          <SideUnselectedGho key={gho.id} data={gho} />
        ))}
      </StyledGridMultiGho>
    </>
  );
};
