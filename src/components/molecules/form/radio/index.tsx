import React from 'react';
import { Controller } from 'react-hook-form';

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

import { InputFormBoxProps } from './types';

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
  ...props
}: InputFormBoxProps<T>) {
  return (
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
          <FormControl error={!!error?.message} variant="standard" {...props}>
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
                func(e);
              }}
            >
              {options.map((option) => {
                const isString = typeof option === 'string';
                const optionData = option as any;
                const key = isString ? option : optionData[valueField];
                const label = isString
                  ? option
                  : renderLabel
                  ? renderLabel(option)
                  : optionData[labelField];

                const disabledValue = isString
                  ? false
                  : 'disabled' in option && optionData['disabled'];

                return (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio />}
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
                    }}
                    {...rest}
                  />
                );
              })}
            </RadioGroup>
            {(!!error?.message || helperText) && (
              <FormHelperText>{error?.message || helperText}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
}
