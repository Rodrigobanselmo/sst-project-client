/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, FC } from 'react';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';

import { STTextField } from './styles';
import { SInputProps } from './types';

export const SInput: FC<SInputProps> = ({
  InputProps,
  circularProps,
  startAdornment,
  endAdornment,
  loading,
  variant = 'outlined',
  subVariant,
  unstyled,
  size = 'medium',
  labelPosition = 'top',
  label,
  error,
  success,
  helperText,
  secondary,
  smallPlaceholder,
  backgroundColor,
  noEffect,
  onChange,
  firstLetterCapitalize,
  ...props
}) => {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (firstLetterCapitalize && e.target.value.length === 1) {
      e.target.value = e.target.value.toUpperCase();
    }

    onChange && onChange(e);
  };

  return (
    <div>
      {label && labelPosition === 'top' && (
        <Typography
          fontSize={14}
          color={error ? 'error.main' : 'grey.600'}
          mb={5}
        >
          {label}
        </Typography>
      )}
      <STTextField
        onChange={handleChange}
        backgroundColor={backgroundColor}
        smallPlaceholder={smallPlaceholder ? 1 : 0}
        color={error ? 'error' : success ? 'success' : 'primary'}
        success={success && !error ? 1 : 0}
        secondary={secondary ? 1 : 0}
        effect={noEffect ? 1 : 0}
        size={size}
        sub_variant={subVariant}
        errors={error ? 1 : 0}
        InputProps={{
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : null,
          endAdornment:
            endAdornment || loading || success || error ? (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress
                    color="secondary"
                    size={size == 'small' ? 10 : 10}
                    {...circularProps}
                  />
                ) : success ? (
                  <CheckCircleIcon sx={{ fontSize: 17 }} color="success" />
                ) : error ? (
                  <ErrorIcon sx={{ fontSize: 17 }} color="error" />
                ) : (
                  endAdornment
                )}
              </InputAdornment>
            ) : null,
          ...InputProps,
        }}
        label={labelPosition === 'center' ? label : ''}
        variant={variant as any}
        unstyled={unstyled ? 1 : 0}
        helperText={helperText}
        {...props}
      />
    </div>
  );
};
