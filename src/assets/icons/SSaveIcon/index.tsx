import React, { FC } from 'react';

import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SSaveIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <SaveOutlinedIcon {...props} />;
};

export default SaveOutlinedIcon;
