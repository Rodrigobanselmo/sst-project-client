import { FC } from 'react';

import { MenuItemProps } from '@mui/material';
import { SIconSortArrowUp } from '@v2/assets/icons/SIconSortArrowUp/SIconSortArrowUp';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';

interface ISPopperMenuItemDescedingProps {
  onClick: MenuItemProps['onClick'];
}

export const SPopperMenuItemDesceding: FC<ISPopperMenuItemDescedingProps> = ({
  onClick,
}) => {
  return (
    <SPopperMenuItem
      text="Ordenação Descendente"
      icon={(props) => <SIconSortArrowUp {...props} fontSize="12px" />}
      onClick={onClick}
    />
  );
};
