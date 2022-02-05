/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';

import { STTextField } from './styles';
import { ISInputProps } from './types';

export const SInput: FC<ISInputProps> = ({
  InputProps,
  circularProps,
  startAdornment,
  endAdornment,
  loading,
  variant = 'outlined',
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
        errors={error ? 1 : 0}
        InputProps={{
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : null,
          endAdornment:
            endAdornment || loading || success || error ? (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={25} {...circularProps} />
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
      {/* <Typography px={7} pt={2} color="grey.600" variant="caption">
        {helperText}
      </Typography> */}
    </>
  );
};
