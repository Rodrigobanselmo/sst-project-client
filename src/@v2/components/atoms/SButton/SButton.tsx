import { FC } from 'react';

import { Box, Button, Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { SButtonProps } from './SButton.types';

const colorMap = {
  paper: {
    colorSchema: undefined,
    backgroundColor: 'white',
    borderColor: 'grey.400',
    color: 'grey.600',
    textColor: 'grey.600',
  },
  normal: {
    colorSchema: undefined,
    backgroundColor: '#2D374811',
    borderColor: 'grey.600',
    color: 'grey.700',
    textColor: 'grey.800',
  },
  success: {
    colorSchema: 'success',
    backgroundColor: '#3cbe7d11',
    borderColor: 'success.dark',
    color: 'success.dark',
    textColor: 'success.dark',
  },
  info: {
    colorSchema: 'info',
    backgroundColor: '#2153b711',
    borderColor: 'info.dark',
    color: 'info.dark',
    textColor: 'info.dark',
  },
  primary: {
    colorSchema: 'info',
    backgroundColor: '#F2732911',
    borderColor: 'primary.dark',
    color: 'primary.dark',
    textColor: 'primary.dark',
  },
} as const;

export const SButton: FC<SButtonProps> = ({
  onClick,
  text,
  icon,
  color = 'normal',
  variant = 'outlined',
  tooltip,
  buttonProps,
}) => {
  return (
    <STooltip title={tooltip || ''} withWrapper>
      <Button
        onClick={onClick}
        variant={variant}
        color={colorMap[color].colorSchema}
        {...buttonProps}
        sx={{
          height: [28, 28, 30],
          textTransform: 'none',
          minWidth: [28, 28, 30],
          boxShadow: 'none',
          borderColor: colorMap[color].borderColor,
          backgroundColor: colorMap[color].backgroundColor,
          color: colorMap[color].color,
          '&:hover': {
            boxShadow: 'none',
            borderColor: colorMap[color].borderColor,
            backgroundColor: colorMap[color].backgroundColor,
          },
          '&:active': {
            boxShadow: 'none',
            borderColor: colorMap[color].borderColor,
            backgroundColor: colorMap[color].backgroundColor,
          },
          borderRadius: 1,
          m: 0,
          px: 3,
          gap: 1,
          ...buttonProps?.sx,
        }}
      >
        {icon && (
          <Icon
            component={icon}
            sx={{
              fontSize: ['1rem', '1rem', '1.1rem'],
              color: colorMap[color].textColor,
            }}
          />
        )}
        {text && (
          <Box
            mr={icon ? 2 : 0}
            fontSize={12}
            color={colorMap[color].textColor}
          >
            {text}
          </Box>
        )}
      </Button>
    </STooltip>
  );
};
