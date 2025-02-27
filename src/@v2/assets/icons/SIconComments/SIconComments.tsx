import { FC } from 'react';

import { IIconProps } from '@v2/types/icon-props.types';
import NotesIcon from '@mui/icons-material/Notes';

export const SIconComments: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <NotesIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
