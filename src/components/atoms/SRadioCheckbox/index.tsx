/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useRef } from 'react';

import Grid from '@mui/material/Grid';
import Typography, { TypographyProps } from '@mui/material/Typography';

import { mergeRefs } from 'core/utils/helpers/mergeRefs';

import SText from '../SText';
import STooltip from '../STooltip';
import { StyledGrid } from './styles';
import { IInputCheckboxProps, SRadioCheckboxProps } from './types';

const InputRadioCheckbox: FC<IInputCheckboxProps> = ({
  option,
  type,
  name = 'name',
  itemProps = { sx: {} },
  valueField,
  contentField,
  gridItemsProps,
  disabled,
  defaultValue,
  inputValue,
  reset,
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

  const tooltip =
    !(typeof option === 'string') && option?.tooltip
      ? (option.tooltip as any)
      : '';

  const { ref: inputRef, ...rest } = inputProps(option) as any;

  const mergedRef = inputRef !== undefined ? mergeRefs(ref, inputRef) : ref;

  const handleCheckbox = () => {
    if (ref.current) {
      const lastValue = inputValue.current;
      if (lastValue == ref.current.value && ref.current.checked && reset) {
        ref.current.checked = false;
        reset();
      } else ref.current?.click();

      inputValue.current = ref.current.value;
    }
  };

  useEffect(() => {
    if (type === 'radio' && ref.current && value === defaultValue) {
      ref.current?.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <STooltip title={tooltip}>
      <Grid {...gridSize} {...gridItemsProps} item>
        <input
          name={type === 'checkbox' ? value : name}
          ref={mergedRef}
          type={type}
          disabled={disabled}
          value={value}
          {...rest}
        />
        <Typography
          borderRadius={'8px'}
          tabIndex={0}
          px={1}
          py={2}
          component="span"
          sx={{
            '&:hover': { borderColor: 'primary.main' },
            textAlign: 'center',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            height: '100%',
            backgroundColor: 'background.paper',
            px: '0.5rem',
            ...sx,
          }}
          onClick={handleCheckbox}
          onKeyPress={(event: any) => event.key === 'Enter' && handleCheckbox()}
          {...props}
        >
          <span
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              display: 'flex',
            }}
          >
            {content}
          </span>
        </Typography>
      </Grid>
    </STooltip>
  );
};

const SRadioCheckbox: FC<SRadioCheckboxProps> = ({
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
  helperText,
  defaultValue,
  reset,
  ...props
}) => {
  if (type === 'radio' && !name)
    throw new Error('type radio requires the name prop');

  const inputValue = useRef('');

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
            inputValue={inputValue}
            inputProps={inputProps}
            key={key}
            reset={reset}
            valueField={valueField}
            contentField={contentField}
            option={option}
            type={type}
            itemProps={itemProps}
            gridItemsProps={gridItemsProps}
            disabled={disabled}
            defaultValue={defaultValue}
          />
        );
      })}
      {(error || helperText) && (
        <SText sx={{ fontSize: 10, color: 'error.main', ml: 12, mt: '0.3rem' }}>
          {helperText ? helperText : 'Campo obrigatório'}
        </SText>
      )}
    </StyledGrid>
  );
};

export default SRadioCheckbox;
