import React, { FC } from 'react';

import AccountTreeIcon from '@mui/icons-material/AccountTree';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SHierarchyIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <AccountTreeIcon {...props} />;
};

export default AccountTreeIcon;
