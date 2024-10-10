import { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconAdd: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <AddIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
