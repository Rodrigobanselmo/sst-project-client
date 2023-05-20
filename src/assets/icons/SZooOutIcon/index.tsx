import React, { FC } from 'react';

import ZoomOutIcon from '@mui/icons-material/ZoomOut';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SZooOutIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <ZoomOutIcon {...props} />;
};

export default ZoomOutIcon;
