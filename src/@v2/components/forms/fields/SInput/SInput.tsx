import { ChangeEvent, FC, useCallback, useRef, useState } from 'react';

import TextField from '@mui/material/TextField';
import { SInputProps } from './SInput.types';
import { stringTransformations } from '@v2/utils/string-transformation';
import { onlyNumbers } from '@brazilian-utils/brazilian-utils';
import { maskOnlyNumber } from '@v2/utils/@masks/only-number.mask';

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
  size = 'md',
  onChange,
  textFieldProps,
  startAdornment,
  endAdornment,
  transformation,
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

  // if (!currentValue && ref.current) ref.current.value = currentValue || '';
  // if (!currentValue && inputRef?.current) inputRef.current.value = currentValue || '';

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
      InputProps={{ ...inputProps, startAdornment, endAdornment }}
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
        ...props.sx,
        '& .MuiInputBase-root': {
          ...sizeMap[size].inputBaseRoot,
        },
        '& .MuiInputLabel-root': {
          color: 'text.light',
          ...sizeMap[size].inputLabelRoot,
          ...(isShrinkLabel && sizeMap[size].inputLabelRootTop),
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
