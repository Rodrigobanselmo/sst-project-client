import React, { FC } from 'react';
import { MdOutlineLock } from 'react-icons/md';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SAccessGroupIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <MdOutlineLock {...props} />;
};

export default MdOutlineLock;
