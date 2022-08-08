import React, { FC } from 'react';
import { FaUserLock } from 'react-icons/fa';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const STeamIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <FaUserLock {...props} />;
};

export default FaUserLock;
