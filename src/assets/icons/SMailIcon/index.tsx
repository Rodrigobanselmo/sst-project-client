import React, { FC } from 'react';

import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SMailIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <MarkEmailReadIcon {...props} />;
};

export default MarkEmailReadIcon;
