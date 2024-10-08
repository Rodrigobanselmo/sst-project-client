import React, { FC } from 'react';

import AppBlockingIcon from '@mui/icons-material/AppBlocking';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SScheduleBlockIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <AppBlockingIcon {...props} />;
};

export default AppBlockingIcon;
