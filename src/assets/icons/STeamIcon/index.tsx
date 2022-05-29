import React, { FC } from 'react';

import PeopleIcon from '@mui/icons-material/People';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const STeamIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <PeopleIcon {...props} />;
};

export default PeopleIcon;
