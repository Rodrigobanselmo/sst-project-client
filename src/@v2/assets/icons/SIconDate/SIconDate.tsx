import { FC } from 'react';

import EventIcon from '@mui/icons-material/Event';
import { IIconProps } from '@v2/types/icon-props.types';
export const SIconDate: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <EventIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
