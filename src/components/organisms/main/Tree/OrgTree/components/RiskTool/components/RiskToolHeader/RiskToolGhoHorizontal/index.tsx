/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useMemo, useRef } from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { TreeTypeEnum } from 'components/organisms/main/Tree/OrgTree/enums/tree-type.enums';
import {
  setGhoSearch,
  setGhoSearchRisk,
  setGhoSelectedId,
} from 'store/reducers/hierarchy/ghoSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHorizontalScroll } from 'core/hooks/useHorizontalScroll';
import { IGho } from 'core/interfaces/api/IGho';
import { arrayChunks } from 'core/utils/arrays/arrayChunks';

import { useListHierarchy } from '../../../hooks/useListHierarchy';
import {
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from '../../../utils/view-data-type.constant';
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
  const selected = useAppSelector((state) => state.gho.selected);
  const refScroll = useHorizontalScroll();
  const { hierarchyListData } = useListHierarchy();

  const handleSelect = useCallback(
    (data: IGho | IHierarchyTreeMapObject) => {
      dispatch(setGhoSelectedId(data));
      if (inputRef && inputRef.current) inputRef.current.value = '';
    },
    [inputRef, dispatch],
  );

  const data = useMemo(() => {
    if (viewDataType == ViewsDataEnum.HIERARCHY) {
      return hierarchyListData();
    }

    if (viewDataType == ViewsDataEnum.ENVIRONMENT) {
      return ghoQuery.filter((gho) => gho.type === HomoTypeEnum.ENVIRONMENT);
    }

    if (viewDataType == ViewsDataEnum.CHARACTERIZATION) {
      return ghoQuery.filter(
        (gho) =>
          gho?.type &&
          [
            HomoTypeEnum.WORKSTATION,
            HomoTypeEnum.EQUIPMENT,
            HomoTypeEnum.ACTIVITIES,
          ].includes(gho.type),
      );
    }

    return ghoQuery;
  }, [viewDataType, ghoQuery, hierarchyListData]);

  const getName = () => {
    if (viewDataType == ViewsDataEnum.HIERARCHY) return selected?.name;

    if (selected && 'description' in selected && selected.description) {
      const splitValues = selected.description.split('(//)');
      if (splitValues[1]) {
        return splitValues[0];
      }
    }

    return selected?.name;
  };

  const name = getName();

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
            placeholder={viewsDataOptionsConstant[viewDataType].placeholder}
          />
          <SText sx={{ px: 5, pt: 2 }}>
            <SText fontSize={13} mr={2} color="text.light">
              selecionado
            </SText>
            <STooltip title={name || '--'} withWrapper>
              <SText
                lineNumber={1}
                component="span"
                fontSize={14}
                fontWeight={500}
                mr={2}
                color="text.light"
              >
                {name || '--'}
              </SText>
            </STooltip>
          </SText>
        </SFlex>
        <StyledFlexMultiGho ref={refScroll}>
          {arrayChunks<IGho | IHierarchyTreeMapObject>(
            data,
            Math.ceil(data.length / 1),
          ).map((ghoChunk, index) => (
            <SFlex key={index}>
              {ghoChunk.map((gho) => {
                if (
                  gho.type === TreeTypeEnum.COMPANY ||
                  gho.type === TreeTypeEnum.WORKSPACE
                )
                  return null;

                return (
                  <RiskToolGhoItem
                    onClick={() => handleSelect(gho)}
                    gho={gho}
                    key={gho.id}
                    viewDataType={viewDataType}
                  />
                );
              })}
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
