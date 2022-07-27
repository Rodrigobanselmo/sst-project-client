import React, { FC } from 'react';

import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SSwapIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <SwapHorizIcon {...props} />;
};

export default SwapHorizIcon;
