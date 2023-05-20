import React, { FC } from 'react';

import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SRotate90Icon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <Rotate90DegreesCwIcon {...props} />;
};

export default Rotate90DegreesCwIcon;
