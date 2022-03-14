import React, { FC } from 'react';

import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SUploadIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <FileUploadOutlinedIcon {...props} />;
};

export default FileUploadOutlinedIcon;
