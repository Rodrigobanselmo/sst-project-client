import React, { FC } from 'react';

import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SReadMessage: FC<IIconMuiProps> = ({ ...props }) => {
  return <DraftsOutlinedIcon {...props} />;
};

export default DraftsOutlinedIcon;
