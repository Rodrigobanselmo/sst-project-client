import React, { FC } from 'react';

import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SGhoIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <GroupWorkOutlinedIcon {...props} />;
};

export default GroupWorkOutlinedIcon;
