/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback, useRef } from 'react';

import SFlex from 'components/atoms/SFlex';
import {
  setGhoSearch,
  setGhoSearchRisk,
  setGhoSelectedId,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useHorizontalScroll } from 'core/hooks/useHorizontalScroll';
import { IGho } from 'core/interfaces/api/IGho';
import { arrayChunks } from 'core/utils/arrays/arrayChunks';

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
}) => {
  const dispatch = useAppDispatch();
  const inputSelectedRef = useRef<HTMLInputElement>(null);
  const refScroll = useHorizontalScroll();

  const handleSelect = useCallback(
    (gho: IGho) => {
      // dispatch(setGhoSearch(''));
      dispatch(setGhoSelectedId(gho));
      if (inputRef && inputRef.current) inputRef.current.value = '';
    },
    [inputRef, dispatch],
  );

  return (
    <>
      <SFlex mt={5} align="center">
        <SideInput
          handleAddGHO={handleAddGHO}
          ref={inputSelectedRef}
          onSearch={(value) => dispatch(setGhoSearch(value))}
          handleSelectGHO={handleSelectGHO}
          handleEditGHO={handleEditGHO}
        />
        <StyledFlexMultiGho ref={refScroll}>
          {arrayChunks(ghoQuery, Math.ceil(ghoQuery.length / 1)).map(
            (ghoChunk, index) => (
              <SFlex key={index}>
                {ghoChunk.map((gho) => (
                  <RiskToolGhoItem
                    onClick={() => handleSelect(gho)}
                    gho={gho}
                    key={gho.id}
                  />
                ))}
              </SFlex>
            ),
          )}
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
