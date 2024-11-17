import { FC } from 'react';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconEdit: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <EditOutlinedIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
