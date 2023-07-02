import React, { FC } from 'react';

import ListAltIcon from '@mui/icons-material/ListAlt';
import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SProtocolIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <ListAltIcon {...props} />;
};

export default ListAltIcon;
