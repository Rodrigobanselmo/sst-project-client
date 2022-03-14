import React, { FC } from 'react';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCompany: FC<IIconMuiProps> = ({ ...props }) => {
  return <BusinessOutlinedIcon {...props} />;
};

export default BusinessOutlinedIcon;
