import { ChangeEvent, FC, useRef, useState } from 'react';

import { CircularProgress, InputAdornment } from '@mui/material';
import TextField from '@mui/material/TextField';
import { SIconError } from '@v2/assets/icons/SIconError/SIconError';
import { stringTransformations } from '@v2/utils/string-transformation';
import { SInputProps } from './SInput.types';

const sizeMap = {
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
} as const;

export const SInput: FC<SInputProps> = ({
  label,
  labelShrink,
  inputProps,
  placeholder,
  inputRef,
  value,
  shrink,
  shadow,
  loading,
  size = 'md',
  onChange,
  textFieldProps,
  startAdornment,
  endAdornment,
  transformation,
  sx,
  ...props
}) => {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange &&
      onChange({
        ...e,
        target: {
          ...e.target,
          value: transformation
            ? stringTransformations(
                String(e.target.value) || '',
                transformation,
              )
            : e.target.value,
        },
      });
  };
  const ref = useRef<HTMLInputElement>(null);
  const [isShrink, setIsShrink] = useState(false);

  const currentValue =
    value ||
    inputProps?.value ||
    textFieldProps?.value ||
    textFieldProps?.InputProps?.value ||
    textFieldProps?.inputProps?.value;

  const isShrinkLabel = isShrink || !!currentValue || shrink;

  const getLabel = () => {
    if (!isShrinkLabel && !value) {
      return label ?? labelShrink;
    } else {
      return labelShrink ?? label;
    }
  };

  return (
    <TextField
      {...textFieldProps}
      {...props}
      value={
        transformation
          ? stringTransformations(String(value) || '', transformation)
          : value
      }
      onChange={handleChange}
      inputRef={inputRef || ref}
      InputProps={{
        ...inputProps,
        startAdornment,
        endAdornment: loading ? (
          <InputAdornment position="end">
            <CircularProgress size={20} />
          </InputAdornment>
        ) : (
          <>
            {endAdornment}
            {!!props.error && (
              <SIconError color="error.main" fontSize={20} ml={4} />
            )}
          </>
        ),
      }}
      placeholder={placeholder}
      InputLabelProps={{
        shrink: isShrinkLabel,
        ...textFieldProps?.InputLabelProps,
      }}
      label={getLabel()}
      size={sizeMap[size].size}
      variant="outlined"
      onFocus={(e) => {
        setIsShrink(true);
        props?.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsShrink(false);
        props?.onBlur?.(e);
      }}
      sx={{
        ...sx,
        '& .MuiInputBase-root': {
          ...sizeMap[size].inputBaseRoot,
        },
        '& .MuiInputLabel-root': {
          color: 'text.light',
          ...sizeMap[size].inputLabelRoot,
          ...(isShrinkLabel && sizeMap[size].inputLabelRootTop),
          ...(props.error && { color: 'error.main' }),
        },
        '& .MuiOutlinedInput-root': {
          boxShadow: !shadow ? 'none' : '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
          backgroundColor: 'background.paper',
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
          {
            borderColor: 'primary.main',
          },
        '&:hover': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'background.default',
            borderWidth: 2,
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
            {
              borderColor: 'primary.main',
              opacity: 1,
            },
        },
      }}
    />
  );
};
