import React, { FC } from 'react';

import UploadFileIcon from '@mui/icons-material/UploadFile';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SUploadFileIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <UploadFileIcon {...props} />;
};

export default SUploadFileIcon;
