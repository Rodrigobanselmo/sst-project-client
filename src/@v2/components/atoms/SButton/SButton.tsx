import { FC } from 'react';

import { Box, Button, CircularProgress, Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { SButtonProps } from './SButton.types';
import { variantMap } from './SButton.constant';

export const SButton: FC<SButtonProps> = ({
  onClick,
  text,
  icon,
  rightIcon,
  color = 'normal',
  variant = 'shade',
  tooltip,
  disabled,
  loading,
  buttonProps,
  textProps,
  size = 'm',
  minWidth,
}) => {
  const colorMap = variantMap[variant].color;
  const sizeMap = variantMap[variant].size;

  return (
    <STooltip title={tooltip || ''} withWrapper>
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        variant="outlined"
        color={colorMap[color].colorSchema}
        {...buttonProps}
        sx={{
          height: sizeMap[size].height,
          textTransform: 'none',
          minWidth: minWidth || sizeMap[size].minWidth,
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
          px: sizeMap[size].px,
          gap: 1,
          '&.Mui-disabled': {
            borderColor: colorMap[color].borderColor,
          },
          ...buttonProps?.sx,
          ...(disabled && {
            '&.Mui-disabled': {
              borderColor: colorMap.disabled.borderColor,
            },
            borderColor: colorMap.disabled.borderColor,
            backgroundColor: colorMap.disabled.backgroundColor,
            color: colorMap.disabled.color,
          }),
        }}
      >
        <>
          {(icon || loading) && (
            <Icon
              component={
                loading
                  ? () => (
                      <Box width={20} height={20}>
                        <CircularProgress
                          size={9}
                          sx={{
                            color: disabled
                              ? colorMap.disabled.textColor
                              : colorMap[color].textColor,
                          }}
                        />
                      </Box>
                    )
                  : () => (
                      <Box width={20} height={20}>
                        {icon}
                      </Box>
                    )
              }
              sx={{
                fontSize: ['1rem', '1rem', '1.1rem'],
                color: disabled
                  ? colorMap.disabled.textColor
                  : colorMap[color].textColor,
              }}
            />
          )}
          {text && (
            <Box
              mr={icon ? 2 : 0}
              fontSize={sizeMap[size].fontSize}
              color={
                disabled
                  ? colorMap.disabled.textColor
                  : colorMap[color].textColor
              }
              {...textProps}
            >
              {text}
            </Box>
          )}
          {rightIcon && (
            <Icon
              component={
                loading && !icon
                  ? () => (
                      <Box width={20} height={20}>
                        <CircularProgress
                          size={9}
                          sx={{
                            color: disabled
                              ? colorMap.disabled.textColor
                              : colorMap[color].textColor,
                          }}
                        />
                      </Box>
                    )
                  : rightIcon
              }
              sx={{
                fontSize: ['1rem', '1rem', '1.1rem'],
                color: disabled
                  ? colorMap.disabled.textColor
                  : colorMap[color].textColor,
              }}
            />
          )}
        </>
      </Button>
    </STooltip>
  );
};
