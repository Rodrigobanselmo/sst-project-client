export const colorMap = {
  paper: {
    colorSchema: undefined,
    borderColor: 'grey.400',
    labelColor: 'text.light',
    focusedBorderColor: 'primary.main',
  },
  normal: {
    colorSchema: undefined,
    borderColor: 'grey.400',
    labelColor: 'text.light',
    focusedBorderColor: 'primary.main',
  },
  success: {
    colorSchema: 'success',
    borderColor: 'grey.400',
    labelColor: 'text.light',
    focusedBorderColor: 'success.main',
  },
  info: {
    colorSchema: 'info',
    borderColor: 'grey.400',
    labelColor: 'text.light',
    focusedBorderColor: 'info.main',
  },
  primary: {
    colorSchema: 'primary',
    borderColor: 'grey.400',
    labelColor: 'text.light',
    focusedBorderColor: 'primary.main',
  },
  danger: {
    colorSchema: 'error',
    borderColor: 'grey.400',
    labelColor: 'text.light',
    focusedBorderColor: 'error.main',
  },
} as const;

export const sizeMap = {
  sm: {
    size: 'small',
    inputBaseRoot: {
      maxHeight: '34px',
      minHeight: '34px',
    },
    inputLabelRoot: {
      fontSize: '13px',
      lineHeight: '14px',
      mt: '1px',
    },
    inputLabelRootTop: {
      top: '3px',
    },
  },
  md: {
    size: 'small',
    inputBaseRoot: {},
    inputLabelRoot: {},
    inputLabelRootTop: {},
  },
  lg: {
    size: 'medium',
    inputBaseRoot: {},
    inputLabelRoot: {},
    inputLabelRootTop: {},
  },
} as const;
