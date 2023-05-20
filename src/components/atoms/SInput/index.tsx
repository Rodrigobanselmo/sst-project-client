/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, FC } from 'react';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, styled } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';

import defaultTheme from 'configs/theme';

import { SHelpIcon } from 'assets/icons/SHelpIcon';

import SFlex from '../SFlex';
import STooltip from '../STooltip';
import { STTextField } from './styles';
import { SInputProps } from './types';

const textDisableInfo = {
  input: {
    '-webkit-text-fill-color': `${defaultTheme.palette.info.main} !important`,
    color: `${defaultTheme.palette.info.main} !important`,
    opacity: `${0.8} !important`,
    '&::placeholder': {
      '-webkit-text-fill-color': `${defaultTheme.palette.grey[600]} !important`,
    },
  },
};

export const SInput: FC<{ children?: any } & SInputProps> = ({
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
  superSmall,
  helpText,
  sx,
  disabled,
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

  const labelSplit = typeof label == 'string' ? label.split('*') : [label];
  const isLeft = labelPosition === 'left';
  return (
    <div>
      <Box
        {...(isLeft && {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        })}
      >
        {label && (labelPosition === 'top' || isLeft) && (
          <SFlex
            mb={5}
            align="center"
            justify="space-between"
            {...(isLeft && {
              mb: -1,
              mt: 1,
              mr: 4,
            })}
          >
            <Typography fontSize={14} color={error ? 'error.main' : 'grey.600'}>
              {labelSplit[0] || label}
              {isLeft ? ':' : ''}
              {labelSplit[1] == '' && (
                <Typography
                  component={'span'}
                  fontSize={14}
                  color={'error.main'}
                >
                  *
                </Typography>
              )}
            </Typography>
            {helpText && (
              <STooltip
                boxProps={{ sx: { my: -1 } }}
                withWrapper
                title={helpText}
              >
                <SHelpIcon
                  sx={{
                    fontSize: 16,
                    color: error ? 'error.main' : 'grey.600',
                    cursor: 'pointer',
                  }}
                />
              </STooltip>
            )}
          </SFlex>
        )}
        <STTextField
          ssx={superSmall ? 1 : 0}
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
          disabled={disabled}
          sx={{ ...(disabled ? textDisableInfo : {}), ...sx }}
          {...props}
        />
      </Box>
    </div>
  );
};
