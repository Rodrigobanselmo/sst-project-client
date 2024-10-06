import { ChangeEvent, FC, useCallback, useState } from 'react';

import TextField from '@mui/material/TextField';
import { SInputProps } from './SInput.types';

const sizeMap = {
  sm: {
    size: 'small',
    inputBaseRoot: {
      maxHeight: '30px',
      minHeight: '30px',
    },
    inputLabelRoot: {
      fontSize: '13px',
      lineHeight: '14px',
    },
    inputLabelRootTop: {
      top: '4px',
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
  value,
  size = 'md',
  onChange,
  ...props
}) => {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange && onChange(e);
  };

  const [isShrink, setIsShrink] = useState(true);

  const togglePlaceholder = useCallback(() => {
    if (value) setIsShrink(false);
    setIsShrink(!isShrink);
  }, [isShrink, value]);

  const getLabel = () => {
    if (isShrink && !value) {
      return labelShrink ?? label;
    } else {
      return label ?? labelShrink;
    }
  };

  return (
    <TextField
      onChange={handleChange}
      InputProps={inputProps}
      placeholder={placeholder}
      label={getLabel()}
      size={sizeMap[size].size}
      variant="outlined"
      {...props}
      onFocus={(e) => {
        togglePlaceholder();
        props?.onFocus?.(e);
      }}
      onBlur={(e) => {
        togglePlaceholder();
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
          ...(!isShrink && sizeMap[size].inputLabelRootTop),
        },

        '& .MuiOutlinedInput-root': {
          boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
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
