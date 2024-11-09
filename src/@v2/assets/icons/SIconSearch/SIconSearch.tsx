import { FC } from 'react';

import { IIconProps } from '@v2/types/icon-props.types';
import SearchIcon from '@mui/icons-material/Search';

export const SIconSearch: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <SearchIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
