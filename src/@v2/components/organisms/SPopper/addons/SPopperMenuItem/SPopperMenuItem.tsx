import { FC, ReactNode } from 'react';

import { Box, BoxProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SFlexProps } from '@v2/components/atoms/SFlex/SFlex.types';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextProps } from '@v2/components/atoms/SText/SText.types';

interface ISPopperMenuItemProps {
  boxProps?: SFlexProps;
  text: string;
  onClick: BoxProps['onClick'];
  textProps?: STextProps;
  disabled?: boolean;
  icon?: (args: { color: string }) => ReactNode;
}

export const SPopperMenuItem: FC<ISPopperMenuItemProps> = ({
  boxProps,
  text,
  icon,
  onClick,
  disabled,
  textProps,
}) => {
  return (
    <SFlex
      align="center"
      px={4}
      py={2}
      {...boxProps}
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
        ...boxProps?.sx,
      }}
    >
      <SFlex center width={14}>
        {icon?.({ color: 'text.primary' })}
      </SFlex>
      <SText color="text.primary" fontSize={12} {...textProps}>
        {text}
      </SText>
    </SFlex>
  );
};
