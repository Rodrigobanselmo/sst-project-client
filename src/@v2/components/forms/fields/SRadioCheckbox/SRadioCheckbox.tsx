import React from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material';

import { SRadioCheckboxProps } from './SRadioCheckbox.types';

export function SRadioCheckbox<T>({
  label,
  options = [],
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  error,
  errorMessage,
  size = 'medium',
  sx,
  ...props
}: SRadioCheckboxProps<T>) {
  const handleChange = (option: T, checked: boolean) => {
    const optionValue = getOptionValue(option).toString();
    const currentValues = Array.isArray(value) ? value : [];

    if (checked) {
      // Add the option to the selection
      const newValues = [...currentValues, option];
      onChange?.(newValues);
    } else {
      // Remove the option from the selection
      const newValues = currentValues.filter(
        (item) => getOptionValue(item).toString() !== optionValue,
      );
      onChange?.(newValues);
    }
  };

  const isOptionSelected = (option: T) => {
    if (!Array.isArray(value)) return false;
    const optionValue = getOptionValue(option).toString();
    return value.some(
      (item) => getOptionValue(item).toString() === optionValue,
    );
  };

  return (
    <FormControl error={!!error} component="fieldset" sx={sx} {...props}>
      {label && (
        <FormLabel component="legend" sx={{ fontSize: 14, mb: 1 }}>
          {label}
        </FormLabel>
      )}
      {options?.map((option) => (
        <FormControlLabel
          key={getOptionValue(option)}
          control={
            <Checkbox
              size={size}
              checked={isOptionSelected(option)}
              onChange={(e) => handleChange(option, e.target.checked)}
              sx={{
                '&.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: size === 'small' ? '1rem' : '1.25rem',
                },
              }}
            />
          }
          label={getOptionLabel(option)}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: 14,
            },
            mb: 0.5,
          }}
        />
      ))}
      {error && (
        <FormHelperText sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>
          {errorMessage || error}
        </FormHelperText>
      )}
    </FormControl>
  );
}
