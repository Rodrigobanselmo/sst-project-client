import { FC } from 'react';

import { IIconProps } from '@v2/types/icon-props.types';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

export const SIconDownload: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <FileDownloadOutlinedIcon
      sx={{
        fontSize: fontSize || 'inherit',
        color: color || 'inherit',
      }}
    />
  );
};
