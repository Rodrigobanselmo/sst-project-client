import { FC } from 'react';

import { Divider } from '@mui/material';
import { SIconHideColumn } from '@v2/assets/icons/SIconHideColumn/SIconHideColumn';
import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SIconSortArrowUp } from '@v2/assets/icons/SIconSortArrowUp/SIconSortArrowUp';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SFlexProps } from '@v2/components/atoms/SFlex/SFlex.types';

interface ISPopperMenuProps extends SFlexProps {}

export const SPopperMenu: FC<ISPopperMenuProps> = ({ children, ...props }) => {
  return (
    <SFlex
      flexDirection={'column'}
      {...props}
      sx={{
        width: '15rem',
        px: 0,
        py: 2,
        ...props?.sx,
      }}
    >
      {children}
    </SFlex>
  );
};
