import React, { FC } from 'react';

import CellTowerOutlinedIcon from '@mui/icons-material/CellTowerOutlined';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SGenerateSource: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <CellTowerOutlinedIcon {...props} />;
};

export default CellTowerOutlinedIcon;
