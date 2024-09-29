import { FC } from 'react';

import SouthIcon from '@mui/icons-material/South';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconSortArrowDown: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <SouthIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
