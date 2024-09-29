import { FC } from 'react';

import { BoxProps } from '@mui/material';
import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';
import { SIconHideColumn } from '@v2/assets/icons/SIconHideColumn/SIconHideColumn';

interface ISPopperMenuItemHideColumnProps {
  onClick: BoxProps['onClick'];
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
