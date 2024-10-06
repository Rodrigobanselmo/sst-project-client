import { FC, PropsWithChildren, useState } from 'react';

import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import Popper from '@mui/material/Popper';

import defaultTheme from 'configs/theme';

import { STArrowStyled } from './SMenu.styles';
import { SMenuProps } from './SMenu.types';
import { Menu } from '@mui/material';

export const SMenu: FC<PropsWithChildren<SMenuProps>> = ({
  children,
  isOpen,
  close,
  anchorEl,
  sx,
  color = 'paper',
  disabledArrow,
  placement = 'bottom-end',
  popperProps,
  ...props
}) => {
  const [arrowRef, setArrowRef] = useState(null);
  const open = Boolean(anchorEl);
  const handleClickAway = () => {
    if (isOpen) close();
  };

  const canBeOpen = isOpen && Boolean(anchorEl.current);
  const id = canBeOpen ? 'transition-popper' : undefined;

  return (
    <Menu
      id="basic-menu"
      anchorEl={arrowRef}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      <MenuItem onClick={handleClose}>Profile</MenuItem>
      <MenuItem onClick={handleClose}>My account</MenuItem>
      <MenuItem onClick={handleClose}>Logout</MenuItem>
    </Menu>
  );
};
