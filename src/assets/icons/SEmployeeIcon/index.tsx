import React, { FC } from 'react';

import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SEmployeeIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <BadgeOutlinedIcon {...props} />;
};

export default BadgeOutlinedIcon;
