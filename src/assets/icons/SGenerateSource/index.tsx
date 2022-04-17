import React, { FC } from 'react';

import CellTowerOutlinedIcon from '@mui/icons-material/CellTowerOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SGenerateSource: FC<IIconMuiProps> = ({ ...props }) => {
  return <CellTowerOutlinedIcon {...props} />;
};

export default CellTowerOutlinedIcon;
