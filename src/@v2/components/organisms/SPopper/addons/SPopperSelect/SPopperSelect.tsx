import React, { FC } from 'react';

import { MenuList, MenuListProps } from '@mui/material';

interface ISPopperMenuProps extends MenuListProps {}

export const SPopperSelect: FC<ISPopperMenuProps> = ({
  children,
  ...props
}) => {
  return (
    <MenuList
      {...props}
      autoFocus={true}
      sx={{
        px: 2,
        py: 2,
        minWidth: '10rem',
        '& > .menu-item': {
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.2)',
        },
        '& > .menu-item:last-child': {
          borderBottom: 'none',
        },
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
