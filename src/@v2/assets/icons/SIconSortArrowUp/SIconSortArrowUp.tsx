import { FC } from 'react';

import NorthIcon from '@mui/icons-material/North';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconSortArrowUp: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <NorthIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
