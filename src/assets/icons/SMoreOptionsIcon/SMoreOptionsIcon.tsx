import React, { FC } from 'react';

import MoreVertIcon from '@mui/icons-material/MoreVert';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SMoreOptionsIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <MoreVertIcon {...props} />;
};

export default MoreVertIcon;
