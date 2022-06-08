import React, { FC } from 'react';

import {
  selectGhoMultiId,
  setGhoMultiEditId,
  selectGhoMultiDisabledId,
  setGhoMultiEditDisabledId,
} from 'store/reducers/hierarchy/ghoMultiSlice';
import { selectGhoSearchSelect } from 'store/reducers/hierarchy/ghoSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { SideMainGho } from '../SideMainGho';
import { SideItemsProps } from './types';

export const SideSelectedGho: FC<SideItemsProps> = ({ data }) => {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectGhoMultiId(data.id));
  const isDisabledSelected = useAppSelector(selectGhoMultiDisabledId(data.id));
  const searchSelected = useAppSelector(selectGhoSearchSelect);

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    dispatch(setGhoMultiEditId(data.id));
  };
  const handleDisableSelect = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    dispatch(setGhoMultiEditDisabledId(data.id));
  };

  if (!isSelected) return null;
  if (
    searchSelected &&
    !stringNormalize(data.name).includes(stringNormalize(searchSelected))
  )
    return null;

  return (
    <SideMainGho
      isSelected={isSelected}
      isEndSelect={isDisabledSelected}
      data={data}
      handleEndSelect={handleDisableSelect}
      handleSelect={handleSelect}
    />
  );
};
