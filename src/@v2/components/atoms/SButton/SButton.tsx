import { FC } from 'react';

import { Box, Button, CircularProgress, Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { SButtonProps } from './SButton.types';
import { variantMap } from './SButton.constant';
import { SFlex } from '../SFlex/SFlex';

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
  schema,
}) => {
  const colorMap = variantMap[variant].color;
  const sizeMap = variantMap[variant].size;
  const disabledButton = disabled || loading;
  return (
    <STooltip title={tooltip || ''} withWrapper>
      <Button
        onClick={onClick}
        disabled={disabledButton}
        variant="outlined"
        color={colorMap[color].colorSchema}
        {...buttonProps}
        sx={{
          height: sizeMap[size].height,
          textTransform: 'none',
          minWidth: minWidth || sizeMap[size].minWidth,
          boxShadow: 'none',
          borderColor: schema?.borderColor || colorMap[color].borderColor,
          backgroundColor:
            schema?.backgroundColor || colorMap[color].backgroundColor,
          color: schema?.color || colorMap[color].color,
          '&:hover': {
            boxShadow: 'none',
            borderColor: schema?.borderColor || colorMap[color].borderColor,
            backgroundColor:
              schema?.backgroundColor || colorMap[color].backgroundColor,
            ...buttonProps?.sx?.['&:hover'],
          },
          '&:active': {
            boxShadow: 'none',
            borderColor: schema?.borderColor || colorMap[color].borderColor,
            backgroundColor:
              schema?.backgroundColor || colorMap[color].backgroundColor,
            ...buttonProps?.sx?.['&:active'],
          },
          borderRadius: 1,
          m: 0,
          px: sizeMap[size].px,
          gap: 1,
          ...buttonProps?.sx,
          ...(disabledButton && {
            ...colorMap.disabled,
            '&:disabled': {
              ...colorMap.disabled,
            },
          }),
        }}
      >
        <>
          {(icon || loading) && (
            <Icon
              component={
                loading
                  ? () => (
                      <SFlex width={20} height={20} center ml={0}>
                        <CircularProgress
                          size={12}
                          sx={{
                            color: disabledButton
                              ? colorMap.disabled.textColor
                              : colorMap[color].textColor,
                          }}
                        />
                      </SFlex>
                    )
                  : () => (
                      <Box width={20} height={20}>
                        {icon}
                      </Box>
                    )
              }
              sx={{
                fontSize: ['1rem', '1rem', '1.1rem'],
                color: disabledButton
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
                disabledButton
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
                            color: disabledButton
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
                color: disabledButton
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
