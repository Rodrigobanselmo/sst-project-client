import { FC } from 'react';

import { BoxProps } from '@mui/material';
import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';
import { SIconHideColumn } from '@v2/assets/icons/SIconHideColumn/SIconHideColumn';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

interface ISPopperMenuItemCleanProps {
  onClick: BoxProps['onClick'];
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
