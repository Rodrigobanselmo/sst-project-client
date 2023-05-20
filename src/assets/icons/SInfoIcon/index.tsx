import React, { FC } from 'react';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SInfoIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <InfoOutlinedIcon {...props} />;
};

export default InfoOutlinedIcon;
