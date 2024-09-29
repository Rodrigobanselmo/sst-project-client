import { FC } from 'react';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconEmptyCheckBox: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <CheckBoxOutlineBlankIcon
      sx={{
        fontSize: fontSize || '16px',
        color: color || 'inherit',
      }}
    />
  );
};
