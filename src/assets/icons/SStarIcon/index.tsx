import React, { FC } from 'react';

import StarBorderIcon from '@mui/icons-material/StarBorder';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SAddIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <StarBorderIcon {...props} />;
};

export default StarBorderIcon;
