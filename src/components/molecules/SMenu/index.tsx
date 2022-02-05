/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, MouseEvent } from 'react';

import Icon from '@mui/material/Icon';

import { STMenu, STMenuItem } from './styles';
import { SMenuProps, IMenuOptionResponse } from './types';

export const SMenu: FC<SMenuProps> = ({
  isOpen,
  close,
  anchorEl,
  handleSelect,
  options,
  icon,
  ...props
}) => {
  const handleMenuSelect = (
    option: IMenuOptionResponse,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    if (isOpen) close();
    handleSelect(option, e);
  };

  return (
    <STMenu anchorEl={anchorEl} open={isOpen} onClose={close} {...props}>
      {options.map((option) => (
        <STMenuItem
          key={option.value}
          onClick={(e) => handleMenuSelect(option, e)}
          sx={{ p: 0, m: 0 }}
        >
          {(icon || option.icon) && (
            <Icon component={option.icon ? option.icon : (icon as any)} />
          )}
          {option.name}
        </STMenuItem>
      ))}
    </STMenu>
  );
};
