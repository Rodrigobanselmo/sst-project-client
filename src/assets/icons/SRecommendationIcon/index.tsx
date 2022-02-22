import React, { FC } from 'react';

import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SRecommendationIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <ThumbUpOffAltIcon {...props} />;
};

export default ThumbUpOffAltIcon;
