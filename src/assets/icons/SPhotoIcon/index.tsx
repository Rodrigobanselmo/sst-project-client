import React, { FC } from 'react';

import CameraAltIcon from '@mui/icons-material/CameraAlt';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SPhotoIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <CameraAltIcon {...props} />;
};

export default SPhotoIcon;