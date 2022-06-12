import React, { FC } from 'react';

import RotateLeftIcon from '@mui/icons-material/RotateLeft';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SRotateLeftIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <RotateLeftIcon {...props} />;
};

export default RotateLeftIcon;
