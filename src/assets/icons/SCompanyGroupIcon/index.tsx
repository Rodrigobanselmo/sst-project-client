import React, { FC } from 'react';
import { BsBuilding } from 'react-icons/bs';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCompanyGroupIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <BsBuilding {...(props as any)} />;
};

export default BsBuilding;
