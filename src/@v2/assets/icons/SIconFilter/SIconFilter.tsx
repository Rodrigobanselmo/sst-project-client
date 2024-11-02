import { FC } from 'react';

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconFilter: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <FilterAltOutlinedIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
