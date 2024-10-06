import { FC } from 'react';

import { MenuItemProps } from '@mui/material';
import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';

interface IPopperMenuItemAscendingProps {
  onClick: MenuItemProps['onClick'];
}

export const SPopperMenuItemAscending: FC<IPopperMenuItemAscendingProps> = ({
  onClick,
}) => {
  return (
    <SPopperMenuItem
      text="Ordenação Ascendente"
      icon={(props) => <SIconSortArrowDown {...props} fontSize="12px" />}
      onClick={onClick}
    />
  );
};
