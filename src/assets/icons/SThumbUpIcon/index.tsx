import React, { FC } from 'react';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SThumbUpIcon: FC<{ children?: any } & IIconMuiProps & any> = ({
  ...props
}) => {
  return <ThumbUpIcon {...props} />;
};

export default ThumbUpIcon;
