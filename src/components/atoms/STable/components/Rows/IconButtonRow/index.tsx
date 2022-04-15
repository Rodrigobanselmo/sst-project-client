import React, { FC } from 'react';

import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';

import { IIconButtonRowProps } from './types';

const IconButtonRow: FC<IIconButtonRowProps> = ({
  icon,
  tooltipTitle,
  sx,
  ...props
}) => (
  <STooltip title={tooltipTitle}>
    <SIconButton sx={{ width: 36, height: 36, mx: 'auto', ...sx }} {...props}>
      {icon}
    </SIconButton>
  </STooltip>
);

export default IconButtonRow;