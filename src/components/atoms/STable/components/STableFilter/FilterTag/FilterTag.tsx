/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SFlexProps } from 'components/atoms/SFlex/types';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { SCloseIcon } from 'assets/icons/SCloseIcon';

import { filterFieldMap } from '../constants/filter.map';
import { IFilterTag } from '../hooks/useFilterTable';

export type IFilterTagProps = {
  tag: IFilterTag;
  onRemove: (tag: IFilterTag) => void;
} & SFlexProps;

export const FilterTag: FC<IFilterTagProps> = ({
  tag,
  onRemove,
  maxWidth,
  ...props
}) => {
  return (
    <SFlex
      border={'1px solid'}
      borderColor="info.light"
      pl={6}
      pr={2}
      borderRadius={2}
      py={1}
      center
      sx={{ backgroundColor: 'grey.100' }}
      minWidth={80}
      {...props}
    >
      <STooltip title={tag.name.length > 30 ? tag.name : ''}>
        <Box display="flex" flexDirection={'column'} flex={1}>
          {tag?.field && (
            <SText
              color="grey.600"
              maxWidth={maxWidth || '150px'}
              noBreak
              fontSize={10}
            >
              {filterFieldMap[tag.field].name}
            </SText>
          )}
          <SText maxWidth={maxWidth || '150px'} noBreak fontSize={11}>
            {tag.name}
          </SText>
        </Box>
      </STooltip>
      <STooltip withWrapper title={'Remover filtro'}>
        <SIconButton onClick={() => onRemove(tag)} size="small">
          <Icon component={SCloseIcon} sx={{ fontSize: '1rem' }} />
        </SIconButton>
      </STooltip>
    </SFlex>
  );
};
