import React, { FC } from 'react';

import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SSignOutIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <PowerSettingsNewIcon {...props} />;
};

export default PowerSettingsNewIcon;
