import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';

import { Box, Typography } from '@mui/material';
import SRadioCheckbox from 'components/atoms/SRadioCheckbox';

import { InputFormBoxProps } from './types';
import { UnmountBox } from '../unmount-box';

export const RadioFormText = ({
  defaultValue,
  name,
  control,
  label,
  onChange,
  options,
  inputProps = {},
  inputPropsFunc,
  type,
  columns,
  reset,
  disabled,
  optionsFieldName,
  ball,
  setValue,
  unmountOnChangeDefault = true,
  ...props
}: InputFormBoxProps) => {
  useEffect(() => {
    defaultValue && setValue?.(name, defaultValue);
  }, [defaultValue, name, setValue]);

  return (
    <UnmountBox
      unmountOnChangeDefault={unmountOnChangeDefault}
      defaultValue={defaultValue}
    >
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
                  color={error ? 'error.main' : 'grey.600'}
                  mb={3}
                >
                  {label}
                </Typography>
              )}
              <SRadioCheckbox
                reset={reset}
                type={type}
                optionsFieldName={optionsFieldName}
                columns={columns}
                options={options}
                name={name}
                helperText={error?.message ?? undefined}
                defaultValue={defaultValue}
                error={!!error}
                ball={ball}
                inputProps={(e) => ({
                  ...(inputPropsFunc ? inputPropsFunc(e) : {}),
                  onChange: (e) => {
                    onChange && onChange(e);
                    func(e);
                  },
                  ...rest,
                })}
                disabled={disabled}
                {...inputProps}
              />
            </Box>
          );
        }}
      />
    </UnmountBox>
  );
};
