import { FC } from 'react';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { IIconProps } from '@v2/types/icon-props.types';
import EventIcon from '@mui/icons-material/Event';
export const SIconDate: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <EventIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
