import { FC } from 'react';

import { IIconProps } from '@v2/types/icon-props.types';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

export const SIconEmail: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <MailOutlineIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
