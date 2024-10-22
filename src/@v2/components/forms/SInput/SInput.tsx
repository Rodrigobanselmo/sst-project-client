import { ChangeEvent, FC, useCallback, useRef, useState } from 'react';

import TextField from '@mui/material/TextField';
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
  size = 'md',
  onChange,
  textFieldProps,
  ...props
}) => {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange && onChange(e);
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
      return labelShrink ?? label;
    } else {
      return label ?? labelShrink;
    }
  };

  // if (!currentValue && ref.current) ref.current.value = currentValue || '';
  // if (!currentValue && inputRef?.current) inputRef.current.value = currentValue || '';

  return (
    <TextField
      {...textFieldProps}
      {...props}
      inputRef={inputRef || ref}
      onChange={handleChange}
      InputProps={inputProps}
      placeholder={placeholder}
      InputLabelProps={{
        shrink: isShrinkLabel,
        ...textFieldProps?.InputLabelProps,
      }}
      label={getLabel()}
      size={sizeMap[size].size}
      variant="outlined"
      value={value}
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
