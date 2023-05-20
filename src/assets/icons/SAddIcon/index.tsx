import React, { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SAddIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <AddIcon {...props} />;
};

export default AddIcon;
