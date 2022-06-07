import React, { FC } from 'react';

import { Checkbox } from '@mui/material';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { STBoxItem } from './styles';
import { SideItemsProps } from './types';

export const SideMainGho: FC<SideItemsProps> = ({
  data,
  handleSelect,
  isSelected,
}) => {
  return (
    <STBoxItem onClick={() => document.getElementById(data.id)?.click()}>
      <Checkbox
        id={data.id}
        checked={isSelected}
        onClick={handleSelect}
        onChange={() => console.log()}
        size="small"
        sx={{
          'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
            color: 'grey.400',
          },
        }}
      />
      <STooltip withWrapper minLength={15} enterDelay={1000} title={data.name}>
        <SText lineNumber={2}>{data.name}</SText>
      </STooltip>
    </STBoxItem>
  );
};
