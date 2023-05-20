import React, { FC } from 'react';
import { MdOutlineLock } from 'react-icons/md';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SAccessGroupIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <MdOutlineLock {...(props as any)} />;
};

export default MdOutlineLock;
