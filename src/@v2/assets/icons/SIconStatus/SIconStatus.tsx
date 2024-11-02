import { FC } from 'react';

import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconStatus: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <LabelOutlinedIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
