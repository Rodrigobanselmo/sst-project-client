import React, { FC } from 'react';

import VaccinesIcon from '@mui/icons-material/Vaccines';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SExamIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <VaccinesIcon {...props} />;
};

export default VaccinesIcon;
