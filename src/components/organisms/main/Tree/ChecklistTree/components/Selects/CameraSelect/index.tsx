import React, { FC } from 'react';

import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import { STagButton } from 'components/atoms/STagButton';
import STooltip from 'components/atoms/STooltip';

import { ICameraSelectProps } from './types';

export const CameraSelect: FC<ICameraSelectProps> = ({ large, ...props }) => {
  return (
    <STooltip withWrapper title={'Recomenda usuário a tirar uma fotografia'}>
      <STagButton
        large={large}
        icon={CameraAltOutlinedIcon}
        text={''}
        {...props}
      />
    </STooltip>
  );
};
