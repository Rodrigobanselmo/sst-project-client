import { FC } from 'react';

import ListAltIcon from '@mui/icons-material/ListAlt';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconForm: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <ListAltIcon
      sx={{
        fontSize: fontSize || '20px',
        color: color || 'inherit',
      }}
    />
  );
};
