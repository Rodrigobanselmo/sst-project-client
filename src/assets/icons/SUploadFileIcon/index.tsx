import React, { FC } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SUploadFileIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <CloudUploadIcon {...props} />;
};

export default CloudUploadIcon;
