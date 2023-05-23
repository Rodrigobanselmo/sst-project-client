import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

import { UnmountBox } from '../unmount-box';
import { InputFormBoxProps, RadioInputProps } from './types';

export function SRadio<T>({
  label,
  onChange,
  options,
  valueField = 'value',
  labelField = 'label',
  disabled,
  renderLabel,
  helperText,
  row,
  value,
  formControlProps,
  errorMessage,
  inputRef,
  ...props
}: RadioInputProps<T>) {
  return (
    <FormControl error={!!errorMessage} variant="standard" {...props}>
      {label && (
        <FormLabel
          sx={{ fontSize: 14, color: 'text.label' }}
          id="demo-error-radios"
        >
          {label}
        </FormLabel>
      )}
      <RadioGroup
        sx={{ pt: 2 }}
        aria-labelledby="demo-error-radios"
        name="quiz"
        value={value}
        row={row}
        onChange={(e) => {
          onChange && onChange(e);
        }}
      >
        {options.map((option) => {
          const isString = typeof option === 'string';
          const optionData = option as any;
          const key = isString ? option : optionData?.[valueField];
          const label = isString
            ? option
            : renderLabel
            ? renderLabel(option)
            : optionData?.[labelField];

          const disabledValue = isString
            ? false
            : 'disabled' in (option as any) && optionData['disabled'];

          return (
            <FormControlLabel
              key={key}
              value={key}
              control={<Radio inputRef={inputRef} />}
              label={label}
              disabled={disabled || disabledValue}
              sx={{
                color: 'text.main',
                '& .MuiSvgIcon-root': {
                  fontSize: 15,
                },
                '& .MuiRadio-root': {
                  p: 3,
                  px: 6,
                },
                '& .MuiTypography-root': {
                  fontSize: 14,
                },
                ...formControlProps?.sx,
                ...(errorMessage && {
                  color: 'error.main',
                  '& .MuiSvgIcon-root': {
                    color: 'error.main',
                    fontSize: 15,
                  },
                }),
              }}
              {...formControlProps}
            />
          );
        })}
      </RadioGroup>
      {(!!errorMessage || helperText) && (
        <FormHelperText>{errorMessage || helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

export function RadioForm<T>({
  defaultValue,
  name,
  control,
  label,
  onChange,
  options,
  valueField = 'value',
  labelField = 'label',
  disabled,
  renderLabel,
  helperText,
  row,
  setValue,
  unmountOnChangeDefault = true,
  boxProps,
  ...props
}: InputFormBoxProps<T>) {
  useEffect(() => {
    defaultValue !== undefined &&
      defaultValue !== null &&
      setValue?.(name, defaultValue as any);
  }, [defaultValue, name, setValue]);

  return (
    <UnmountBox
      unmountOnChangeDefault={unmountOnChangeDefault}
      defaultValue={defaultValue}
      {...boxProps}
    >
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          field: { onChange: func, value, ...rest },
          fieldState: { error },
        }) => {
          return (
            <SRadio
              options={options}
              errorMessage={error?.message}
              label={label}
              value={value}
              helperText={helperText}
              valueField={valueField}
              labelField={labelField}
              inputRef={rest.ref}
              disabled={disabled}
              formControlProps={rest}
              row={row}
              renderLabel={renderLabel}
              onChange={(e) => {
                onChange && onChange(e);
                func(e);
              }}
              {...props}
            />
          );
        }}
      />
    </UnmountBox>
  );
}
