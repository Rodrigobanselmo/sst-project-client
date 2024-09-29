import { FC } from 'react';

import CheckBox from '@mui/icons-material/CheckBox';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconCheckBox: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <CheckBox
      sx={{
        fontSize: fontSize || '16px',
        color: color || 'inherit',
      }}
    />
  );
};
