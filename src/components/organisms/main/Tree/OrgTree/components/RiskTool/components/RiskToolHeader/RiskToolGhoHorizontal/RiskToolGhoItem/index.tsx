/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import {
  selectGhoMultiId,
  selectGhoMultiDisabledId,
  setGhoMultiEditDisabledId,
  setGhoMultiEditId,
} from 'store/reducers/hierarchy/ghoMultiSlice';
import {
  selectGhoIsSelected,
  selectGhoSearch,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IGho } from 'core/interfaces/api/IGho';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

export const RiskToolGhoItem: FC<BoxProps & { gho: IGho }> = ({
  gho,
  ...props
}) => {
  const isSelected = useAppSelector(selectGhoIsSelected(gho.id));
  const searchSelected = useAppSelector(selectGhoSearch);

  if (
    searchSelected &&
    !stringNormalize(gho.name).includes(stringNormalize(searchSelected)) &&
    !isSelected
  )
    return null;

  const selected = {} as any;

  if (isSelected) {
    selected.sx = { '*': { color: 'white !important' } };
    selected.bg = 'success.main';
  }

  return <STagButton large text={gho.name} {...selected} {...props} />;
};
