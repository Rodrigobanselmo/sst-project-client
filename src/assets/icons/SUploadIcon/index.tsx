import React, { FC } from 'react';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SUploadIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <CloudUploadIcon {...props} />;
};

export default CloudUploadIcon;
