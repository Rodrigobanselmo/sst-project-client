import React, { FC } from 'react';

import {
  selectGhoMultiId,
  setGhoMultiEditId,
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
  const searchSelected = useAppSelector(selectGhoSearchSelect);

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    dispatch(setGhoMultiEditId(data.id));
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
      data={data}
      handleSelect={handleSelect}
    />
  );
};
