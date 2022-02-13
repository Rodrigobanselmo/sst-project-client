/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

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
  ...props
}) => {
  return (
    <>
      {labelPosition === 'top' && (
        <Typography
          fontSize={14}
          color={error ? 'error.main' : 'grey.500'}
          mb={5}
        >
          {label}
        </Typography>
      )}
      <STTextField
        color={error ? 'error' : success ? 'success' : 'primary'}
        success={success && !error ? 1 : 0}
        secondary={secondary ? 1 : 0}
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
                    size={size == 'small' ? 20 : 25}
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
    </>
  );
};
