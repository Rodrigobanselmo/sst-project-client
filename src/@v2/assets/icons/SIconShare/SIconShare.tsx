import { FC } from 'react';

import LinkIcon from '@mui/icons-material/Link';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconShare: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <LinkIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
