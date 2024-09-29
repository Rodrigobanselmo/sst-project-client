import { FC } from 'react';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconHideColumn: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <VisibilityOffOutlinedIcon
      sx={{
        fontSize: fontSize || '14px',
        color: color || 'inherit',
      }}
    />
  );
};
