import React, { FC } from 'react';

import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SMailIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <MarkEmailReadIcon {...props} />;
};

export default MarkEmailReadIcon;
