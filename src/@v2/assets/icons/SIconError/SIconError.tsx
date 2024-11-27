import { FC } from 'react';

import ErrorIcon from '@mui/icons-material/Error';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconError: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <ErrorIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
