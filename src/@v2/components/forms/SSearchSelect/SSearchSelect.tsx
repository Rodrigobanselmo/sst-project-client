import { ReactNode, useState } from 'react';
import { SInput } from '../SInput/SInput';
import { SInputProps } from '../SInput/SInput.types';
import { InputEndAdormentSelect } from './components/InputEndAdormentSelect/InputEndAdormentSelect';
import { PopperSelect } from './components/PopperSelect/PopperSelect';

export interface SSearchSelectProps<Value> {
  options: Value[];
  value?: Value | null;
  inputProps?: Partial<SInputProps>;
  errorMessage?: string;
  label?: string;
  loading?: boolean;
  placeholder?: string;
  getOptionLabel: (option: Value) => string;
  getOptionValue: (option: Value) => string | number | boolean;
  onChange: (value: Value | null, event: React.SyntheticEvent) => void;
  onInputChange?: (value: string, event: React.SyntheticEvent) => void;
  component?: (() => JSX.Element) | React.ElementType;
  renderOption?: (args: {
    option: Value;
    label: string;
    isSelected: boolean;
    handleSelect: (e: any) => void;
  }) => ReactNode;
}

export function SSearchSelect<T>({
  inputProps,
  errorMessage,
  label,
  options,
  loading,
  placeholder,
  onInputChange,
  onChange,
  value,
  getOptionLabel,
  getOptionValue,
  component: Component,
  renderOption,
}: SSearchSelectProps<T>) {
  const [shrink, setShrink] = useState(false);

  const handleSelect = (value: T | null, e: any) => {
    onChange(value, e);
  };

  return (
    <PopperSelect
      renderOption={renderOption}
      getOptionLabel={getOptionLabel}
      onChange={handleSelect}
      getOptionValue={(option) => getOptionValue(option)}
      onClose={() => setShrink(false)}
      selected={value ? [value] : []}
      options={options}
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
          inputProps={{
            endAdornment: (
              <InputEndAdormentSelect
                loading={loading}
                onClear={(e) => {
                  onInputChange?.('', e);
                  onChange(null, e);
                }}
              />
            ),
          }}
          sx={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            ...inputProps?.sx,
          }}
        />
      )}
    </PopperSelect>
  );
}
