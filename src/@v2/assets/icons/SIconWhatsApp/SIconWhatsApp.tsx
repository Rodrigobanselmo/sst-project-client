import { FC } from 'react';

import { IIconProps } from '@v2/types/icon-props.types';
import WhatsAppIcon from 'assets/icons/SWhatsAppIcon';

export const SIconWhatsApp: FC<IIconProps> = ({ color, fontSize }) => {
  return (
    <WhatsAppIcon
      sx={{
        fontSize: fontSize || '12px',
        color: color || 'inherit',
      }}
    />
  );
};
