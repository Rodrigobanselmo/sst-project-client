/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useRef } from 'react';

import Grid from '@mui/material/Grid';
import Typography, { TypographyProps } from '@mui/material/Typography';

import { mergeRefs } from 'core/utils/helpers/mergeRefs';

import SText from '../SText';
import { StyledGrid } from './styles';
import { IInputCheckboxProps, ISRadioCheckboxType } from './types';

const InputRadioCheckbox: FC<IInputCheckboxProps> = ({
  option,
  type,
  name = 'name',
  itemProps = { sx: {} },
  valueField,
  contentField,
  gridItemsProps,
  disabled,
  inputProps = () => {
    return {};
  },
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const { sx, ...props } = itemProps as TypographyProps;

  const value = typeof option === 'string' ? option : option[valueField];
  const content = typeof option === 'string' ? option : option[contentField];

  const gridSize =
    !(typeof option === 'string') && option?.gridSize
      ? (option.gridSize as any)
      : { xs: 1 };

  const { inputRef, ...rest } = inputProps(option) as any;

  const mergedRef = inputRef !== undefined ? mergeRefs(ref, inputRef) : ref;

  const handleCheckbox = () => {
    ref.current?.click();
  };

  return (
    <Grid {...gridSize} {...gridItemsProps} item>
      <input
        name={type === 'checkbox' ? value : name}
        ref={mergedRef}
        type={type}
        disabled={disabled}
        {...rest}
      />
      <Typography
        borderRadius={'8px'}
        px={1}
        py={2}
        component="span"
        sx={{
          '&:hover': { borderColor: 'primary.main' },
          textAlign: 'center',
          fontSize: '0.875rem',
          ...sx,
        }}
        onClick={handleCheckbox}
        {...props}
      >
        {content}
      </Typography>
    </Grid>
  );
};

const SRadioCheckbox: FC<ISRadioCheckboxType> = ({
  options,
  optionsFieldName,
  columns = 3,
  inputProps,
  name,
  type = 'checkbox',
  itemProps,
  gridItemsProps,
  disabled,
  error,
  ...props
}) => {
  if (type === 'radio' && !name)
    throw new Error('type radio requires the name prop');

  const valueField =
    (optionsFieldName && optionsFieldName?.valueField) ?? 'value';
  const contentField =
    (optionsFieldName && optionsFieldName?.contentField) ??
    (typeof options[0] !== 'string' && options[0]?.content
      ? 'content'
      : 'value');

  return (
    <StyledGrid
      error={error ? 1 : 0}
      columns={columns}
      spacing={4}
      container
      {...props}
    >
      {options.map((option) => {
        const key = typeof option === 'string' ? option : option[valueField];

        return (
          <InputRadioCheckbox
            inputProps={inputProps}
            key={key}
            valueField={valueField}
            contentField={contentField}
            option={option}
            type={type}
            itemProps={itemProps}
            gridItemsProps={gridItemsProps}
            disabled={disabled}
          />
        );
      })}
      {error && (
        <SText sx={{ fontSize: 10, color: 'error.main', ml: 12, mt: '0.3rem' }}>
          Campo obrigatório
        </SText>
      )}
    </StyledGrid>
  );
};

export default SRadioCheckbox;
