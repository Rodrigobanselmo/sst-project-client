import { FC } from 'react';

import { MenuItemProps } from '@mui/material';
import { SIconHideColumn } from '@v2/assets/icons/SIconHideColumn/SIconHideColumn';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';

interface ISPopperMenuItemHideColumnProps {
  onClick: MenuItemProps['onClick'];
}

export const SPopperMenuItemHideColumn: FC<ISPopperMenuItemHideColumnProps> = ({
  onClick,
}) => {
  return (
    <SPopperMenuItem
      disabled
      text="Ocultar Coluna"
      icon={(props) => <SIconHideColumn {...props} fontSize="12px" />}
      onClick={onClick}
    />
  );
};
