import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';

import { STBoxItem } from './styles';
import { SideItemsProps } from './types';

export const SideItems: FC<SideItemsProps> = ({
  data,
  isSelected,
  isDeleteLoading,
  handleDeleteGHO,
  handleSelectGHO,
}) => {
  const hierarchies = data.hierarchies
    ? data.hierarchies.map((value) => value.id)
    : [];

  return (
    <STBoxItem
      sx={{
        border: isSelected ? ' 2px solid' : ' 1px solid',
        borderColor: isSelected ? 'info.main' : 'background.divider',
      }}
    >
      <STooltip minLength={15} enterDelay={1000} title={data.name}>
        <Box sx={{ display: 'flex', width: '75%' }}>
          <SText lineNumber={2}>{data.name}</SText>
        </Box>
      </STooltip>
      <SFlex>
        <SIconButton
          loading={isDeleteLoading}
          onClick={() => handleDeleteGHO(data.id)}
          size="small"
        >
          <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
        </SIconButton>
        <SIconButton
          onClick={() => handleSelectGHO(isSelected ? null : data, hierarchies)}
          size="small"
        >
          <Icon
            component={isSelected ? SCloseIcon : SEditIcon}
            sx={{
              fontSize: '1.2rem',
              color: isSelected ? 'info.main' : '',
            }}
          />
        </SIconButton>
      </SFlex>
    </STBoxItem>
  );
};
