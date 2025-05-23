import { ReactNode, useState } from 'react';
import { SInput } from '../SInput/SInput';
import { SInputProps } from '../SInput/SInput.types';
import { InputEndAdormentSelect } from './components/InputEndAdormentSelect/InputEndAdormentSelect';
import { Box, BoxProps } from '@mui/material';
import { PopperSelect } from './components/PopperSelect/PopperSelect';

export interface SSearchSelectProps<Value> {
  options: Value[];
  value?: Value | null;
  inputProps?: Partial<SInputProps>;
  errorMessage?: string;
  label?: string;
  labelShrink?: string;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  getOptionLabel: (option: Value) => string;
  getOptionValue: (option: Value) => string | number | boolean;
  onChange: (value: Value | null, event: React.SyntheticEvent) => void;
  onScrollEnd?: () => void;
  onInputChange?: (value: string, event: React.SyntheticEvent) => void;
  component?: (() => JSX.Element) | React.ElementType;
  boxProps?: BoxProps;
  renderFullOption?: (args: {
    option: Value;
    label: string;
    isSelected: boolean;
    handleSelect: (e: any) => void;
  }) => ReactNode;
  onSearch?: (value: string) => void;
  popperStartCompoent?: React.ReactNode;
  renderItem?: (args: {
    option: Value;
    label: string;
    isSelected: boolean;
  }) => ReactNode;
}

export function SSearchSelect<T>({
  inputProps,
  errorMessage,
  label,
  labelShrink,
  options,
  loading,
  placeholder,
  onInputChange,
  onChange,
  renderItem,
  value,
  getOptionLabel,
  getOptionValue,
  component: Component,
  renderFullOption,
  onScrollEnd,
  boxProps,
  onSearch,
  popperStartCompoent,
  disabled,
}: SSearchSelectProps<T>) {
  const [shrink, setShrink] = useState(false);

  const handleSelect = (value: T | null, e: any) => {
    onChange(value, e);
  };

  const handleClean = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    onInputChange?.('', event);
    onChange(null, event);
  };

  return (
    <Box {...boxProps}>
      <PopperSelect
        disabled={disabled}
        startCompoent={popperStartCompoent}
        loading={loading}
        renderItem={renderItem}
        renderFullOption={renderFullOption}
        getOptionLabel={getOptionLabel}
        onChange={handleSelect}
        getOptionValue={(option) => getOptionValue(option)}
        onClose={() => setShrink(false)}
        selected={value ? [value] : []}
        onScrollEnd={onScrollEnd}
        options={options}
        onClean={handleClean}
        onSearchFunc={onSearch}
      >
        {Component && <Component />}
        {!Component && (
          <SInput
            fullWidth
            {...inputProps}
            error={!!errorMessage}
            value={value ? getOptionLabel(value) : ''}
            onFocus={() => setShrink(true)}
            shrink={shrink}
            onChange={(e) => {
              onInputChange?.(e.target.value, e);
            }}
            helperText={errorMessage}
            placeholder={placeholder}
            label={label}
            labelShrink={labelShrink}
            endAdornment={
              <>
                <InputEndAdormentSelect
                  loading={loading}
                  mr={inputProps?.endAdornment ? 4 : 0}
                  onClear={(e) => {
                    e.stopPropagation();
                    onInputChange?.('', e);
                    onChange(null, e);
                  }}
                />
                {inputProps?.endAdornment}
              </>
            }
            sx={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              ...inputProps?.sx,
            }}
          />
        )}
      </PopperSelect>
    </Box>
  );
}

/*
        <SSearchSelect
          loading={true}
          getOptionValue={(option) => option.label}
          label="Estado"
          value={{ label: 'Rodrigo' }}
          getOptionLabel={(option) => option.label}
          renderItem={({ option }) => (
            <Box>
              <SText>{option.label}</SText>
            </Box>
          )}
          onChange={(option) => {
            console.log(option);
          }}
          onInputChange={(value) => console.log(value)}
          placeholder="Estado (UF)"
          options={[1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
            label: `Rodrigo ${num}`,
          }))}
*/
