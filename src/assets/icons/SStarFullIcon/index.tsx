import React, { FC } from 'react';

import StarIcon from '@mui/icons-material/Star';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SAddIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <StarIcon {...props} />;
};

export default StarIcon;
