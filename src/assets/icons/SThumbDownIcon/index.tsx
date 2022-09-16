import React, { FC } from 'react';

import ThumbDownIcon from '@mui/icons-material/ThumbDown';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SThumbDownIcon: FC<IIconMuiProps & any> = ({ ...props }) => {
  return <ThumbDownIcon {...props} />;
};

export default ThumbDownIcon;
