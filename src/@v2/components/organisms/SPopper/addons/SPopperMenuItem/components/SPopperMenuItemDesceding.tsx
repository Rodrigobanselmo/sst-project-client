import { FC } from 'react';

import { BoxProps } from '@mui/material';
import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';
import { SIconSortArrowUp } from '@v2/assets/icons/SIconSortArrowUp/SIconSortArrowUp';

interface ISPopperMenuItemDescedingProps {
  onClick: BoxProps['onClick'];
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
