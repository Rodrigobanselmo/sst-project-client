import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { SelectedTableItemProps } from './types';

export const SelectedTableItem: FC<
  { children?: any } & SelectedTableItemProps
> = ({ name, tooltip, handleRemove, isExpired, handleEdit }) => {
  return (
    <STooltip title={tooltip || name}>
      <SFlex
        sx={{
          border: '1px solid',
          borderColor: 'gray.300',
          borderStyle: 'dashed',
          borderRadius: 1,
          ...(isExpired ? { borderColor: 'error.main' } : {}),
          ...(handleEdit ? { cursor: 'pointer' } : {}),
        }}
        mt={4}
        align="center"
        onClick={() => handleEdit?.()}
      >
        <SIconButton
          sx={{ maxWidth: 10, maxHeight: 10 }}
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
        >
          <Icon component={SDeleteIcon} sx={{ fontSize: 14 }} />
        </SIconButton>
        <SText
          lineNumber={2}
          variant="body2"
          sx={{
            ...(isExpired ? { color: 'error.main' } : {}),
          }}
        >
          {name}
        </SText>
      </SFlex>
    </STooltip>
  );
};
