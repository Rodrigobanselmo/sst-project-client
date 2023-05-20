import React, { FC } from 'react';

import ZoomInIcon from '@mui/icons-material/ZoomIn';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SZooInIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <ZoomInIcon {...props} />;
};

export default ZoomInIcon;
