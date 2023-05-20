import React, { FC } from 'react';
import { FaUserLock } from 'react-icons/fa';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const STeamIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <FaUserLock {...(props as any)} />;
};

export default FaUserLock;
