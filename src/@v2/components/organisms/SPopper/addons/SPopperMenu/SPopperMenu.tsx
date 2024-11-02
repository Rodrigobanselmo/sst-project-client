import React, { FC } from 'react';

import { MenuList, MenuListProps } from '@mui/material';

interface ISPopperMenuProps extends MenuListProps {}

export const SPopperMenu: FC<ISPopperMenuProps> = ({ children, ...props }) => {
  return (
    <MenuList
      {...props}
      autoFocus={true}
      sx={{
        minWidth: '15rem',
        px: 0,
        py: 2,
        '&:focus': {
          outline: 'none',
          borderColor: 'transparent',
        },
        ...props?.sx,
      }}
    >
      {children}
    </MenuList>
  );
};
