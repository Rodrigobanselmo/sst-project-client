/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useStore } from 'react-redux';

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

import { SUncheckBoxIcon } from 'assets/icons/SCheckboxIcon';
import SSwapIcon from 'assets/icons/SSwapIcon';
import { SCheckboxIcon } from 'assets/icons/SUncheckBoxIcon';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IGho } from 'core/interfaces/api/IGho';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { TreeTypeEnum } from '../../../../enums/tree-type.enums';
import { useListHierarchy } from '../../hooks/useListHierarchy';
import { StyledGridMultiGho } from '../../styles';
import {
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from '../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../RiskToolViews/RiskToolRiskView/types';
import { SideInput } from '../SIdeInput';
import { SideSelectedGho } from '../SideToSelectedGho/SideSelectedGho';
import { SideUnselectedGho } from '../SideToSelectedGho/SideUnselectedGho';
import { SaveButton } from './SaveButton';
import { TotalTag } from './TotalTag';
import { SideSelectViewContentProps } from './types';

export const SideSelectViewContent: FC<SideSelectViewContentProps> = ({
  handleAddGHO,
  handleSelectGHO,
  handleEditGHO,
  ghoQuery,
  inputRef,
  viewDataType,
}) => {
  const dispatch = useAppDispatch();
  const inputSelectedRef = useRef<HTMLInputElement>(null);
  const { hierarchyListData } = useListHierarchy();
  const store = useStore();

  const dataList = useMemo<(IHierarchyTreeMapObject | IGho)[]>(() => {
    if (viewDataType === ViewsDataEnum.HIERARCHY) {
      return hierarchyListData();
    }

    if (viewDataType == ViewsDataEnum.ENVIRONMENT) {
      return ghoQuery.filter((gho) => gho.type === HomoTypeEnum.ENVIRONMENT);
    }

    if (viewDataType === ViewsDataEnum.CHARACTERIZATION)
      return ghoQuery.filter(
        (gho) =>
          gho?.type &&
          [
            HomoTypeEnum.WORKSTATION,
            HomoTypeEnum.EQUIPMENT,
            HomoTypeEnum.ACTIVITIES,
          ].includes(gho.type),
      );

    return ghoQuery.filter((gho) => !gho.type);
  }, [ghoQuery, hierarchyListData, viewDataType]);

  const handleSelectAll = useCallback(() => {
    const search = store.getState().gho.search as string;
    const allToSelect = dataList
      .filter((gho) =>
        stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputRef && inputRef.current) inputRef.current.value = '';
    dispatch(setGhoSearch(''));

    dispatch(setGhoMultiAddIds(allToSelect));
  }, [store, dataList, inputRef, dispatch]);

  const handleUnselectAll = useCallback(() => {
    const search = store.getState().gho.searchSelect as string;
    const selectedIds = store.getState().ghoMulti.selectedIds as string;
    const selectedDisabledIds = store.getState().ghoMulti
      .selectedDisabledIds as string[];

    const allDisabledSelect = dataList
      .filter(
        (gho) =>
          selectedDisabledIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    const allActiveSelect = dataList
      .filter(
        (gho) =>
          selectedIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)) &&
          !allDisabledSelect.includes(gho.id),
      )
      .map((gho) => gho.id);

    if (inputSelectedRef.current) inputSelectedRef.current.value = '';
    dispatch(setGhoSearchSelect(''));

    dispatch(setGhoMultiRemoveIds(allActiveSelect));
  }, [dataList, dispatch, store]);

  const handleInvertDisabled = useCallback(() => {
    const search = store.getState().gho.searchSelect as string;
    const selectedIds = store.getState().ghoMulti.selectedIds as string[];
    const selectedDisabledIds = store.getState().ghoMulti
      .selectedDisabledIds as string[];

    const allSelected = dataList
      .filter(
        (gho) =>
          selectedIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    const allDisabledSelect = dataList
      .filter(
        (gho: IHierarchyTreeMapObject | IGho) =>
          selectedDisabledIds.includes(gho.id) &&
          stringNormalize(gho.name).includes(stringNormalize(search)),
      )
      .map((gho) => gho.id);

    if (inputSelectedRef.current) inputSelectedRef.current.value = '';
    dispatch(setGhoSearchSelect(''));

    dispatch(setGhoMultiDisabledAddIds(allSelected));
    dispatch(setGhoMultiDisabledRemoveIds(allDisabledSelect));
  }, [dataList, dispatch, store]);

  return (
    <>
      <SFlex mt={5} align="center">
        <SideInput
          ref={inputSelectedRef}
          onSearch={(value) => dispatch(setGhoSearchSelect(value))}
          handleSelectGHO={handleSelectGHO}
          handleEditGHO={handleEditGHO}
          placeholder={viewsDataOptionsConstant[viewDataType].placeholder}
        />
        <SFlex align="center" sx={{ ml: 'auto', mr: 5 }}>
          <TotalTag />
          <STagButton
            icon={SSwapIcon}
            text="Inverter desabiitados"
            large
            mr={5}
            tooltipTitle="Todos os items desabilitados seram ativadoes e vice-versa"
            onClick={handleInvertDisabled}
          />
          <STagButton
            icon={SUncheckBoxIcon}
            tooltipTitle="Remover todos os GHOs ativos"
            mr={5}
            large
            text="Remover ativos"
            onClick={handleUnselectAll}
          />
          <SaveButton />
        </SFlex>
      </SFlex>
      <StyledGridMultiGho>
        {dataList.map((gho) => {
          if (viewDataType == ViewsDataEnum.GSE && gho.type) {
            return null;
          }
          return (
            <SideSelectedGho
              viewDataType={viewDataType}
              key={gho.id}
              data={gho}
            />
          );
        })}
      </StyledGridMultiGho>
      <SFlex align="center">
        <SideInput
          ref={inputRef}
          onSearch={(value) => dispatch(setGhoSearch(value))}
          handleSelectGHO={handleSelectGHO}
          handleEditGHO={handleEditGHO}
          handleAddGHO={handleAddGHO}
          placeholder={viewsDataOptionsConstant[viewDataType].placeholder}
        />
        <STagButton
          icon={SCheckboxIcon}
          tooltipTitle="Selecione todos os GHOs abaixo"
          sx={{ ml: 'auto', mr: 5 }}
          large
          text="Selecione todos"
          onClick={handleSelectAll}
        />
      </SFlex>
      <StyledGridMultiGho>
        {dataList.map((gho) => {
          if (viewDataType == ViewsDataEnum.GSE && gho.type) {
            return null;
          }

          if (
            gho.type === TreeTypeEnum.WORKSPACE ||
            gho.type === TreeTypeEnum.COMPANY
          )
            return null;

          return (
            <SideUnselectedGho
              viewDataType={viewDataType}
              key={gho.id}
              data={gho}
            />
          );
        })}
      </StyledGridMultiGho>
    </>
  );
};
