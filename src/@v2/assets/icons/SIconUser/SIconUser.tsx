import { FC } from 'react';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconUser: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <PersonOutlineIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
