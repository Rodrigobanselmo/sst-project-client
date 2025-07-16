import { ChangeEvent, FC, useRef, useState } from 'react';

import { CircularProgress, InputAdornment } from '@mui/material';
import TextField from '@mui/material/TextField';
import { SIconError } from '@v2/assets/icons/SIconError/SIconError';
import { stringTransformations } from '@v2/utils/string-transformation';
import { SInputProps } from './SInput.types';
import { colorMap, sizeMap } from './SInput.constant';

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
  color = 'normal',
  onChange,
  textFieldProps,
  startAdornment,
  endAdornment,
  transformation,
  sx,
  variant = 'outlined',
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
      variant={variant}
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
          color: props.error ? 'error.main' : colorMap[color].labelColor,
          ...sizeMap[size].inputLabelRoot,
          ...(isShrinkLabel && sizeMap[size].inputLabelRootTop),
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: props.error
            ? 'error.main'
            : colorMap[color].focusedBorderColor,
        },
        // Standard variant focused label
        '& .MuiInput-root.Mui-focused .MuiInputLabel-root': {
          color: props.error
            ? 'error.main'
            : colorMap[color].focusedBorderColor,
        },
        '& .MuiOutlinedInput-root': {
          boxShadow: !shadow ? 'none' : '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
          backgroundColor: 'background.paper',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: props.error ? 'error.main' : colorMap[color].borderColor,
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
          {
            borderColor: props.error
              ? 'error.main'
              : colorMap[color].focusedBorderColor,
          },
        // Standard variant underline
        '& .MuiInput-root:after': {
          borderColor: props.error
            ? 'error.main'
            : colorMap[color].focusedBorderColor,
        },
        '&:hover': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: props.error
              ? 'error.main'
              : colorMap[color].borderColor,
            borderWidth: 2,
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
            {
              borderColor: props.error
                ? 'error.main'
                : colorMap[color].focusedBorderColor,
              opacity: 1,
            },
        },
      }}
    />
  );
};
