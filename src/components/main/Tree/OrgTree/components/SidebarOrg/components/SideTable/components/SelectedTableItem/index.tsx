import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { SelectedTableItemProps } from './types';

export const SelectedTableItem: FC<SelectedTableItemProps> = ({
  name,
  handleRemove,
}) => {
  return (
    <STooltip title={name}>
      <SFlex
        sx={{
          border: '1px solid',
          borderColor: 'gray.300',
          borderStyle: 'dashed',
          borderRadius: 1,
        }}
        mt={4}
        align="center"
      >
        <SIconButton
          sx={{ maxWidth: 10, maxHeight: 10 }}
          onClick={() => handleRemove()}
        >
          <Icon component={SDeleteIcon} sx={{ fontSize: 14 }} />
        </SIconButton>
        <SText lineNumber={2} variant="body2">
          {name}
        </SText>
      </SFlex>
    </STooltip>
  );
};
