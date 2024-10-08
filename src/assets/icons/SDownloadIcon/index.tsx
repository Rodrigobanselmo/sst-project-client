import React, { FC } from 'react';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SDownloadIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <FileDownloadOutlinedIcon {...props} />;
};

export default FileDownloadOutlinedIcon;
