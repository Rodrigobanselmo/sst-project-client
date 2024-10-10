import { FC } from 'react';

import { IIconProps } from '@v2/types/icon-props.types';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';

export const SIconClose: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <CloseTwoToneIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
