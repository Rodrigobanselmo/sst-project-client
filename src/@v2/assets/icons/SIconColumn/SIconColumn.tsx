import { FC } from 'react';

import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconColumn: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <ViewWeekOutlinedIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
