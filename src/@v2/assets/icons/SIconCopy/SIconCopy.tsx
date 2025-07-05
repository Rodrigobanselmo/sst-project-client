import { FC } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IIconProps } from '@v2/types/icon-props.types';

export const SIconCopy: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <ContentCopyIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
