import { FC } from 'react';

import DeleteOutlineTwoToneIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconDelete: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <DeleteOutlineTwoToneIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
