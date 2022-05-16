import React from 'react';
import { Controller } from 'react-hook-form';

import { Box, Typography } from '@mui/material';
import SRadioCheckbox from 'components/atoms/SRadioCheckbox';

import { InputFormBoxProps } from './types';

export const RadioForm = ({
  defaultValue,
  name,
  control,
  label,
  onChange,
  options,
  inputProps = {},
  type,
  columns,
  ...props
}: InputFormBoxProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        field: { onChange: func, value, ...rest },
        fieldState: { error },
      }) => {
        return (
          <Box mr={-3} {...props}>
            {label && (
              <Typography
                fontSize={14}
                color={error ? 'error.main' : 'grey.500'}
                mb={3}
              >
                {label}
              </Typography>
            )}
            <SRadioCheckbox
              type={type}
              columns={columns}
              options={options}
              name={name}
              helperText={error?.message ?? undefined}
              defaultValue={defaultValue}
              error={!!error}
              inputProps={() => ({
                onChange: (e) => {
                  onChange && onChange(e);
                  func(e);
                },
                ...rest,
              })}
              {...inputProps}
            />
          </Box>
        );
      }}
    />
  );
};
