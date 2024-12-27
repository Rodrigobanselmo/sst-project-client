import { FC, ReactNode } from 'react';

import { MenuItem, MenuItemProps } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextProps } from '@v2/components/atoms/SText/SText.types';
import React from 'react';

type ISPopperSelectItemProps = {
  itemProps?: MenuItemProps;
  onClick: MenuItemProps['onClick'];
  textProps?: STextProps;
  disabled?: boolean;
  selected?: boolean;
  text?: ReactNode;
  startAddon?: ReactNode;
  compoent?: ReactNode;
  rerender?: number;
};

export const SPopperSelectItem = React.memo<ISPopperSelectItemProps>(
  ({
    itemProps,
    onClick,
    disabled,
    selected,
    textProps,
    startAddon,
    text,
    compoent,
  }) => {
    return (
      <MenuItem
        {...itemProps}
        onClick={onClick}
        className="menu-item"
        sx={{
          cursor: 'pointer',
          mb: 1,
          userSelect: 'none',
          minHeight: 35,
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
          ...(selected && {
            backgroundColor: 'mainBlur.10',
          }),
          mx: 4,
          pl: 0,
          pr: 6,
          borderRadius: 1,
          ...itemProps?.sx,
        }}
      >
        {!!startAddon && <>{startAddon}</>}
        {compoent}
        {!!text && (
          <SText pl={6} color="text.primary" fontSize={14} {...textProps}>
            {text}
          </SText>
        )}
      </MenuItem>
    );
  },
  (nextProps, prevProps) => nextProps.rerender === prevProps.rerender,
);
