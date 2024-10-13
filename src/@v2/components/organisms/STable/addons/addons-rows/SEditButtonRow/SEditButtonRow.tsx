import { ArrowDropDown } from '@mui/icons-material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { BoxProps, IconButton, Paper, TypographyProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextProps } from '@v2/components/atoms/SText/SText.types';
import { MouseEvent as ReactMouseEvent } from 'react';

export interface SEditButtonRowProps {
  label: string;
  anchorEl: React.RefObject<HTMLDivElement>;
  onClick: (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => void;
  boxProps?: BoxProps;
  textProps?: STextProps;
  color?: string;
}

export const SEditButtonRow = ({
  label,
  onClick,
  anchorEl,
  boxProps,
  textProps,
  color = 'text.main',
}: SEditButtonRowProps) => {
  return (
    <SFlex
      ref={anchorEl}
      m="auto"
      onClick={(e) => onClick(e)}
      justify={'space-between'}
      align={'center'}
      px={4}
      width={'fit-content'}
      pr={2}
      {...boxProps}
      sx={{
        borderRadius: '5px',
        borderColor: 'gray.400',
        cursor: 'pointer',
        backgroundColor: 'grey.50',
        borderWidth: '1px',
        position: 'relative',
        userSelect: 'none',
        borderStyle: 'solid',
        ':hover': {
          filter: 'brightness(0.95)',
          borderColor: 'gray.500',
        },
        ':active': {
          filter: 'brightness(0.9)',
          borderColor: 'gray.600',
        },
        ...boxProps?.sx,
      }}
    >
      <SText color={color} fontSize={12} lineNumber={1} {...textProps}>
        {label}
      </SText>
      <ArrowDropDown
        sx={{
          fontSize: 15,
          color: color,
        }}
      />
    </SFlex>
  );
};
