import { FormHelperText } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import * as React from 'react';

export const sizeMap = {
  sm: {
    size: 'small',
    inputBaseRoot: {
      minHeight: '34px',
    },
    inputLabelRoot: {
      fontSize: '13px',
      lineHeight: '14px',
      mt: '0px',
    },
    inputLabelRootTop: {
      top: '3px',
    },
    inputSelect: {
      py: '0px',
    },
  },
  md: {
    size: 'small',
    inputBaseRoot: {},
    inputLabelRoot: {},
    inputLabelRootTop: {},
    inputSelect: {},
  },
} as const;

export interface SSelectProps<T, R extends string | number> {
  validValue?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  isShrink: boolean;
  children: React.ReactNode;
  errorMessage?: string;
}

export function SelectFormControl<T, R extends string | number>({
  children,
  isShrink,
  validValue,
  label,
  size = 'sm',
  errorMessage,
}: SSelectProps<T, R>) {
  const isShrinkLabel = isShrink || validValue;

  return (
    <FormControl
      fullWidth
      onClick={(e) => e.stopPropagation()}
      size="small"
      sx={{
        '& .close-icon': {
          display: 'none',
        },
        '&:hover': {
          '& .close-icon': {
            display: 'flex',
          },
        },
        '& .MuiSelect-select': {
          ...sizeMap[size].inputSelect,
        },
        '& .MuiInputBase-root': {
          backgroundColor: 'background.paper',
          ...sizeMap[size].inputBaseRoot,
        },
        '& .MuiInputLabel-root': {
          color: 'text.light',
          ...sizeMap[size].inputLabelRoot,
          ...(isShrinkLabel && sizeMap[size].inputLabelRootTop),
        },
      }}
    >
      <InputLabel id="simple-select-label" error={!!errorMessage}>
        {label}
      </InputLabel>
      {children}
      {!!errorMessage && (
        <FormHelperText error={!!errorMessage}>{errorMessage}</FormHelperText>
      )}
    </FormControl>
  );
}
