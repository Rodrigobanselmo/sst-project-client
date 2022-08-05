import React, { FC } from 'react';

import AccountBoxIcon from '@mui/icons-material/AccountBox';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SProfessionalIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <AccountBoxIcon {...props} />;
};

export default AccountBoxIcon;