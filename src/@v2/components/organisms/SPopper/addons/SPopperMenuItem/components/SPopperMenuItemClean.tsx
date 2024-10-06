import { FC } from 'react';

import { MenuItemProps } from '@mui/material';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';

interface ISPopperMenuItemCleanProps {
  onClick: MenuItemProps['onClick'];
}

export const SPopperMenuItemClean: FC<ISPopperMenuItemCleanProps> = ({
  onClick,
}) => {
  return (
    <SPopperMenuItem
      text="Limpar"
      onClick={onClick}
      textProps={{
        color: 'error.dark',
      }}
    />
  );
};
