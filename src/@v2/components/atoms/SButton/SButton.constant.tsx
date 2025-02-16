import { FC } from 'react';

import { Box, Button, CircularProgress, Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { SButtonProps } from './SButton.types';

export const colorMap = {
  paper: {
    colorSchema: undefined,
    backgroundColor: 'white',
    borderColor: 'grey.400',
    color: 'grey.600',
    textColor: 'grey.600',
  },
  disabled: {
    colorSchema: undefined,
    backgroundColor: 'grey.300',
    borderColor: 'grey.300',
    color: 'grey.700',
    textColor: 'grey.700',
    fontWeight: 'normal',
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
    colorSchema: 'primary',
    backgroundColor: '#F2732911',
    borderColor: 'primary.dark',
    color: 'primary.dark',
    textColor: 'primary.dark',
  },
} as const;

export const sizeMap = {
  s: {
    height: [28, 28, 30],
    minWidth: [28, 28, 30],
    fontSize: 12,
    px: 3,
  },
  m: {
    height: [28, 28, 30],
    minWidth: [28, 28, 30],
    fontSize: 12,
    px: 3,
  },
  l: {
    height: [30, 30, 32],
    minWidth: [30, 30, 32],
    fontSize: 14,
    px: 5,
  },
} as const;

export const colorTextMap = {
  paper: {
    ...colorMap.paper,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  disabled: {
    ...colorMap.disabled,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  normal: {
    ...colorMap.normal,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  success: {
    ...colorMap.success,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  info: {
    ...colorMap.info,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  primary: {
    ...colorMap.primary,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
} as const;

export const colorOutlineMap = {
  paper: {
    ...colorMap.paper,
    backgroundColor: 'transparent',
  },
  disabled: {
    ...colorMap.disabled,
    borderColor: 'grey.500',
    backgroundColor: 'transparent',
  },
  normal: {
    ...colorMap.normal,
    backgroundColor: 'transparent',
  },
  success: {
    ...colorMap.success,
    backgroundColor: 'transparent',
  },
  info: {
    ...colorMap.info,
    backgroundColor: 'transparent',
  },
  primary: {
    ...colorMap.primary,
    backgroundColor: 'transparent',
  },
} as const;

export const colorContainedMap = {
  paper: {
    ...colorMap.paper,
    backgroundColor: '#ffffff',
    borderColor: 'transparent',
    textColor: 'grey.700',
  },
  disabled: {
    ...colorMap.disabled,
  },
  normal: {
    ...colorMap.normal,
    backgroundColor: '#2D3748',
    borderColor: 'transparent',
    textColor: 'white',
  },
  success: {
    ...colorMap.success,
    backgroundColor: '#3cbe7d',
    borderColor: 'transparent',
    textColor: 'white',
  },
  info: {
    ...colorMap.info,
    backgroundColor: '#2153b7',
    borderColor: 'transparent',
    textColor: 'white',
  },
  primary: {
    ...colorMap.primary,
    backgroundColor: '#F27329',
    borderColor: 'transparent',
    textColor: 'white',
  },
} as const;

export const variantMap = {
  text: {
    color: colorTextMap,
    size: sizeMap,
  },
  shade: {
    color: colorMap,
    size: sizeMap,
  },
  outlined: {
    color: colorOutlineMap,
    size: sizeMap,
  },
  contained: {
    color: colorContainedMap,
    size: sizeMap,
  },
} as const;
