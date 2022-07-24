import React, { FC } from 'react';
import { BsBuilding } from 'react-icons/bs';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCompanyGroupIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <BsBuilding {...props} />;
};

export default BsBuilding;
