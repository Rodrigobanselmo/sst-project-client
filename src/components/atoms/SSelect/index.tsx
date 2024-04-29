/* eslint-disable react/display-name */
import React, { FC, useCallback, useMemo } from 'react';

import { Box, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import useId from '@mui/utils/useId';

import defaultTheme from 'configs/theme';

import { StyledSelect } from './styles';
import { IOption, SSelectProps } from './types';

const textDisableInfo = {
  div: {
    '-webkit-text-fill-color': `${defaultTheme.palette.info.main} !important`,
    color: `${defaultTheme.palette.info.main} !important`,
    opacity: `${0.8} !important`,
  },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SSelect: FC<{ children?: any } & SSelectProps> = ({
  loading,
  circularProps,
  children,
  options,
  label,
  helperText,
  optionsFieldName,
  size,
  width,
  labelPosition = 'top',
  sx,
  error,
  required,
  formControlProps,
  formHelperTextProps,
  inputLabelProps,
  menuItemProps,
  menuEmptyItemProps,
  dropDownProps,
  value: initialValue,
  multiple,
  color,
  emptyItem,
  inputRef,
  renderMenu,
  renderMenuItemChildren,
  renderEmptyItemChildren,
  disabled,
  variant,
  beforeItem = '',
  beforeItemStyles,
  placeholder,
  defaultValue,
  inputProps,
  superSmall,
  ...props
}) => {
  const id = useId();

  const valueField =
    (optionsFieldName && optionsFieldName?.valueField) ?? 'value';
  const contentField =
    (optionsFieldName && optionsFieldName?.contentField) ?? 'content';

  const valueProp = multiple && !initialValue ? [] : initialValue;
  const defaultEmptyValue = placeholder || emptyItem ? '' : '';

  const isLoading = useMemo(() => {
    if (!loading) return {};
    return {
      IconComponent: () => (
        <Box>
          <CircularProgress
            sx={{ mr: '14px' }}
            size={size === 'small' ? '1rem' : '1.25rem'}
            data-testid="CTextFieldCircularProgress"
            {...circularProps}
          />
        </Box>
      ),
    };
  }, [loading, circularProps, size]);

  const onRenderMenuItems = useCallback(
    (option: IOption | string | number, index: number) => {
      const valueKey =
        typeof option === 'string' || typeof option === 'number'
          ? option
          : option[valueField];

      const content =
        typeof option === 'string' || typeof option === 'number'
          ? option
          : option[contentField];

      if (renderMenu) return renderMenu(option, index);

      return (
        <MenuItem key={valueKey} value={valueKey} {...menuItemProps}>
          {renderMenuItemChildren
            ? renderMenuItemChildren(option, index)
            : content}
        </MenuItem>
      );
    },
    [
      valueField,
      contentField,
      renderMenu,
      menuItemProps,
      renderMenuItemChildren,
    ],
  );

  const labelSplit = typeof label == 'string' ? label.split('*') : [label];
  return (
    <FormControl
      required={required}
      error={error}
      size={size}
      fullWidth={!width}
      color={color}
      disabled={disabled}
      variant={variant}
      {...formControlProps}
    >
      {label && labelPosition === 'center' && (
        <InputLabel id={id + '-label'} {...inputLabelProps}>
          {labelSplit[0] || label}
          {labelSplit[1] == '' && (
            <Typography component={'span'} fontSize={14} color={'error.main'}>
              *
            </Typography>
          )}
        </InputLabel>
      )}
      {label && labelPosition === 'top' && (
        <Typography
          fontSize={14}
          color={error ? 'error.main' : 'grey.600'}
          mb={5}
        >
          {labelSplit[0] || label}
          {labelSplit[1] == '' && (
            <Typography component={'span'} fontSize={14} color={'error.main'}>
              *
            </Typography>
          )}
        </Typography>
      )}
      <StyledSelect
        ssx={superSmall ? 1 : 0}
        legend={!(label && labelPosition === 'top') ? 1 : 0}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: 'common.white',
              mt: '1px',
            },
            ...dropDownProps,
          },
        }}
        inputProps={{
          ...inputProps,
          sx: beforeItem
            ? {
                '&:before': {
                  content: `"${beforeItem}"`,
                  ml: 1,
                  mr: 1,
                  color: 'text.primary',
                  fontWeight: 400,
                  ...beforeItemStyles,
                },
              }
            : {},
        }}
        native={false}
        sx={{
          height: size == 'small' ? '2.5rem' : '3rem',
          ...(disabled && textDisableInfo),
          width,
          '& .MuiSelect-select': {
            color: 'text.primary',
            padding: '1rem',
          },
          ...sx,
        }}
        {...(valueProp ? { value: valueProp || defaultEmptyValue } : {})}
        multiple={multiple}
        labelId={id + '-label'}
        id={id}
        label={label}
        defaultValue={defaultValue ? defaultValue : defaultEmptyValue}
        ref={inputRef}
        displayEmpty
        errors={error ? 1 : 0}
        {...isLoading}
        {...props}
      >
        {children}
        {placeholder && (
          <MenuItem disabled value="" {...menuItemProps}>
            {renderEmptyItemChildren
              ? renderEmptyItemChildren(placeholder)
              : placeholder}
          </MenuItem>
        )}
        {emptyItem && (
          <MenuItem value=" " {...menuItemProps} {...menuEmptyItemProps}>
            {renderEmptyItemChildren
              ? renderEmptyItemChildren(emptyItem)
              : emptyItem}
          </MenuItem>
        )}

        {options &&
          options
            .map((option, index) => onRenderMenuItems(option, index))
            .flat()}
      </StyledSelect>
      {helperText && (
        <FormHelperText
          sx={{
            fontSize: '10px',
          }}
          {...formHelperTextProps}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default SSelect;
