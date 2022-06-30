/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useMemo, useRef } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import {
  setGhoSearch,
  setGhoSearchRisk,
  setGhoSelectedId,
} from 'store/reducers/hierarchy/ghoSlice';
import { selectAllHierarchyTreeNodes } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHorizontalScroll } from 'core/hooks/useHorizontalScroll';
import { IGho } from 'core/interfaces/api/IGho';
import { arrayChunks } from 'core/utils/arrays/arrayChunks';
import { sortString } from 'core/utils/sorts/string.sort';

import { ViewsDataEnum } from '../../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../../RiskToolViews/RiskToolRiskView/types';
import { SideInput } from '../../SIdeInput';
import { RiskToolColumns } from '../RiskToolColumns';
import { RiskToolGhoItem } from './RiskToolGhoItem';
import { StyledFlexMultiGho } from './styles';
import { SideSelectViewContentProps } from './types';

export const RiskToolGhoHorizontal: FC<SideSelectViewContentProps> = ({
  handleAddGHO,
  handleSelectGHO,
  handleEditGHO,
  ghoQuery,
  inputRef,
  viewType,
  viewDataType,
}) => {
  const dispatch = useAppDispatch();
  const inputSelectedRef = useRef<HTMLInputElement>(null);
  const hierarchyTree = useAppSelector(selectAllHierarchyTreeNodes);
  const selected = useAppSelector((state) => state.gho.selected);
  const refScroll = useHorizontalScroll();

  const handleSelect = useCallback(
    (data: IGho | IHierarchyTreeMapObject) => {
      dispatch(setGhoSelectedId(data));
      if (inputRef && inputRef.current) inputRef.current.value = '';
    },
    [inputRef, dispatch],
  );

  const data = useMemo(() => {
    if (viewDataType == ViewsDataEnum.HIERARCHY) {
      const hierarchyArray: IHierarchyTreeMapObject[] = Object.values(
        hierarchyTree,
      )
        .map((node) => {
          const parent = node.parentId
            ? hierarchyTree[node.parentId]
            : { parentId: null };

          const parent2 = parent?.parentId
            ? hierarchyTree[parent.parentId]
            : { parentId: null };

          const parent3 = parent2?.parentId
            ? hierarchyTree[parent2.parentId]
            : { parentId: null };

          const parent4 = parent3?.parentId
            ? hierarchyTree[parent3.parentId]
            : { parentId: null };

          const parent5 = parent4?.parentId
            ? hierarchyTree[parent4.parentId]
            : { parentId: null };

          const parent6 = parent5?.parentId
            ? hierarchyTree[parent5.parentId]
            : { parentId: null };

          const parentsName = [
            parent6,
            parent5,
            parent4,
            parent3,
            parent2,
            parent,
          ]
            .map((parent) =>
              parent && 'label' in parent && parent.parentId
                ? parent.label
                : '',
            )
            .filter((i) => i)
            .join(' > ');

          return {
            ...node,
            name: node.label,
            id: node.id as string,
            parentsName: parentsName,
          };
        })
        .sort((a, b) => sortString(a, b, 'name'));

      return hierarchyArray;
    }

    return ghoQuery;
  }, [hierarchyTree, ghoQuery, viewDataType]);

  return (
    <>
      <SFlex mt={5}>
        <SFlex direction="column" justify="space-between" mt={4}>
          <SideInput
            handleAddGHO={handleAddGHO}
            ref={inputSelectedRef}
            onSearch={(value) => dispatch(setGhoSearch(value))}
            handleSelectGHO={handleSelectGHO}
            handleEditGHO={handleEditGHO}
          />
          <SText sx={{ px: 5, pt: 2 }}>
            <SText fontSize={13} mr={2} color="text.light">
              selecionado
            </SText>
            <STooltip title={selected?.name || '--'} withWrapper>
              <SText
                lineNumber={2}
                component="span"
                fontSize={14}
                fontWeight={500}
                mr={2}
                color="text.light"
              >
                {selected?.name || '--'}
              </SText>
            </STooltip>
          </SText>
        </SFlex>
        <StyledFlexMultiGho ref={refScroll}>
          {arrayChunks<IGho | IHierarchyTreeMapObject>(
            data,
            Math.ceil(data.length / 2),
          ).map((ghoChunk, index) => (
            <SFlex key={index}>
              {ghoChunk.map((gho) => (
                <RiskToolGhoItem
                  onClick={() => handleSelect(gho)}
                  gho={gho}
                  key={gho.id}
                  viewDataType={viewDataType}
                />
              ))}
            </SFlex>
          ))}
        </StyledFlexMultiGho>
      </SFlex>
      <SFlex align="center" gap={4} mb={0} mt={4}>
        <SideInput
          ref={inputSelectedRef}
          onSearch={(value) => dispatch(setGhoSearchRisk(value))}
          handleSelectGHO={handleSelectGHO}
          handleEditGHO={handleEditGHO}
          placeholder="Pesquisar por risco"
        />
        <RiskToolColumns viewType={viewType} />
      </SFlex>
    </>
  );
};
