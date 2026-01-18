import React from 'react';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { SRadioProps } from './SRadio.types';
import { SSpeakButton } from '@v2/components/atoms/SSpeakButton/SSpeakButton';

export function SRadio<T>({
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
  enableSpeak = false,
  ...props
}: SRadioProps<T>) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedOption = options?.find(
      (option) => getOptionValue(option).toString() === event.target.value,
    );
    onChange?.(selectedOption || null);
  };

  const selectedValue = value ? getOptionValue(value).toString() : '';

  return (
    <FormControl error={!!error} component="fieldset" sx={sx} {...props}>
      {label && (
        <FormLabel component="legend" sx={{ fontSize: 14, mb: 1 }}>
          {label}
        </FormLabel>
      )}
      <RadioGroup value={selectedValue} onChange={handleChange}>
        {options?.map((option) => (
          <Box
            key={String(getOptionValue(option))}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FormControlLabel
              value={getOptionValue(option).toString()}
              control={
                <Radio
                  size={size}
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
                flex: 1,
              }}
            />
            {enableSpeak && (
              <SSpeakButton
                text={getOptionLabel(option)}
                size="small"
                tooltip="Ouvir opção"
              />
            )}
          </Box>
        ))}
      </RadioGroup>
      {error && (
        <FormHelperText
          sx={{
            color: 'error.main',
            fontSize: 12,
            mt: 2,
            ml: -1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 20, mr: 3, color: 'error.main' }} />
          {errorMessage || error}
        </FormHelperText>
      )}
    </FormControl>
  );
}
