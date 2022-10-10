import React, { FC } from 'react';

import CachedIcon from '@mui/icons-material/Cached';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SReloadIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <CachedIcon {...props} />;
};

export default CachedIcon;
