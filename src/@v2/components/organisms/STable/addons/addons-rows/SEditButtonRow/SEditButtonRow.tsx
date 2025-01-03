import { ArrowDropDown } from '@mui/icons-material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import {
  BoxProps,
  CircularProgress,
  IconButton,
  Paper,
  TypographyProps,
} from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextProps } from '@v2/components/atoms/SText/SText.types';
import { MouseEvent as ReactMouseEvent } from 'react';

export interface SEditButtonRowProps {
  label: string;
  anchorEl?: React.RefObject<HTMLDivElement>;
  onClick: (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => void;
  boxProps?: BoxProps;
  textProps?: STextProps;
  color?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export const SEditButtonRow = ({
  label,
  onClick,
  anchorEl,
  boxProps,
  textProps,
  color = 'text.main',
  loading,
  disabled,
  icon = (
    <ArrowDropDown
      sx={{
        fontSize: 15,
        color: color,
      }}
    />
  ),
}: SEditButtonRowProps) => {
  return (
    <SFlex
      ref={anchorEl}
      m="auto"
      onClick={(e) => (disabled ? null : onClick(e))}
      justify={'space-between'}
      align={'center'}
      px={4}
      width={'fit-content'}
      pr={2}
      py={1}
      color={color}
      {...boxProps}
      sx={{
        borderRadius: '5px',
        borderColor: 'gray.400',
        backgroundColor: 'grey.50',
        borderWidth: '1px',
        position: 'relative',
        userSelect: 'none',
        borderStyle: 'solid',
        ...(!disabled && {
          cursor: 'pointer',
          ':hover': {
            filter: 'brightness(0.95)',
            borderColor: 'gray.500',
          },
          ':active': {
            filter: 'brightness(0.9)',
            borderColor: 'gray.600',
          },
        }),
        opacity: loading ? 0.5 : 1,
        ...boxProps?.sx,
      }}
    >
      <SText color={color} fontSize={12} lineNumber={1} {...textProps}>
        {label}
      </SText>
      {loading ? (
        <CircularProgress size={10} sx={{ mr: 2 }} color="inherit" />
      ) : (
        icon
      )}
    </SFlex>
  );
};
