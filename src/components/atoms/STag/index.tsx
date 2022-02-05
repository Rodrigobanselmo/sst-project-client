import React, { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FeedIcon from '@mui/icons-material/Feed';

import SFlex from '../SFlex';
import { ISTagProps } from './types';

export const STag: FC<ISTagProps> = ({
  text,
  action,
  icon: Icon,
  sx,
  ...props
}) => {
  return (
    <SFlex
      sx={{
        backgroundColor: action === 'add' ? 'tag.add' : 'tag.edit',
        borderRadius: '3px',
        color: 'common.white',
        pr: 8,
        pl: action === 'add' ? 3 : 6,
        mr: 2,
        ...sx,
      }}
      align="center"
      {...props}
    >
      {action === 'add' && (
        <AddIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'edit' && (
        <FeedIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'delete' && (
        <DeleteIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {!action ? text : ''}
      {action === 'add' ? 'Adicionar' : ''}
      {action === 'edit' ? 'Editar' : ''}
      {action === 'delete' ? 'Deletar' : ''}

      {Icon && <Icon sx={{ fontSize: '18px', color: 'common.white' }} />}
      {!action ? text : ''}
    </SFlex>
  );
};
