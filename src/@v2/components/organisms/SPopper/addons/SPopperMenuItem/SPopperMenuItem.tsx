import { FC, ReactNode } from 'react';

import { MenuItem, MenuItemProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextProps } from '@v2/components/atoms/SText/SText.types';

interface ISPopperMenuItemProps {
  itemProps?: MenuItemProps;
  text: string;
  onClick: MenuItemProps['onClick'];
  textProps?: STextProps;
  disabled?: boolean;
  icon?: (args: { color: string }) => ReactNode;
}

export const SPopperMenuItem: FC<ISPopperMenuItemProps> = ({
  itemProps,
  text,
  icon,
  onClick,
  disabled,
  textProps,
}) => {
  return (
    <MenuItem
      {...itemProps}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
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
      <SFlex center width={14}>
        {icon?.({ color: 'text.primary' })}
      </SFlex>
      <SText color="text.primary" fontSize={12} {...textProps}>
        {text}
      </SText>
    </MenuItem>
  );
};
