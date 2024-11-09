import { FC, ReactNode } from 'react';

import { MenuItem, MenuItemProps } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextProps } from '@v2/components/atoms/SText/SText.types';

interface ISPopperSelectItemProps {
  itemProps?: MenuItemProps;
  text: string;
  onClick: MenuItemProps['onClick'];
  textProps?: STextProps;
  disabled?: boolean;
  startAddon?: ReactNode;
}

export const SPopperSelectItem: FC<ISPopperSelectItemProps> = ({
  itemProps,
  text,
  onClick,
  disabled,
  textProps,
  startAddon,
}) => {
  return (
    <MenuItem
      {...itemProps}
      onClick={onClick}
      className="menu-item"
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        height: 35,
        '&:hover': {
          backgroundColor: 'grey.200',
        },
        '&:active': {
          backgroundColor: 'grey.300',
        },
        ...(disabled && {
          pointerEvents: 'none',
          opacity: 0.5,
        }),
        ...itemProps?.sx,
      }}
    >
      {startAddon}
      <SText color="text.primary" fontSize={14} {...textProps}>
        {text}
      </SText>
    </MenuItem>
  );
};
