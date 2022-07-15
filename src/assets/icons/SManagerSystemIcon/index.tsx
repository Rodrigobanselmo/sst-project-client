import React, { FC } from 'react';

import ManageHistoryIcon from '@mui/icons-material/ManageHistory';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SManagerSystemIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ManageHistoryIcon {...props} />;
};

export default ManageHistoryIcon;
