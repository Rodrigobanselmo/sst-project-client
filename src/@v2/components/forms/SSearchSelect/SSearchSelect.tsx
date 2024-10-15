import { useState } from 'react';
import { SInput } from '../SInput/SInput';
import { SInputProps } from '../SInput/SInput.types';
import { InputEndAdormentSelect } from './components/InputEndAdormentSelect/InputEndAdormentSelect';
import { PopperSelect } from './components/PopperSelect/PopperSelect';

export interface SSearchSelectProps<Value> {
  options: Value[];
  value: Value | null;
  inputProps?: Partial<SInputProps>;
  errorMessage?: string;
  label?: string;
  loading?: boolean;
  placeholder?: string;
  getOptionLabel: (option: Value) => string;
  onChange: (value: Value | null, event: React.SyntheticEvent) => void;
  onInputChange?: (value: string, event: React.SyntheticEvent) => void;
}

// <SSearchSelect
// label="Estado"
// value={value}
// getOptionLabel={(option) => option.label}
// onChange={(option) => {
//   setValue(option);
// }}
// onInputChange={(value) => console.log(value)}
// placeholder="Estado (UF)"
// options={[
//   { label: 'Rodrigo Rodrigo Rodrigo Rodrigo Rodrigo Rodrigo' },
//   { label: 'Anselmo Anselmo Anselmo' },
//   { label: 'Barbosa Rodrigo Rodrigo Anselmo' },
// ]}
// />

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
}: SSearchSelectProps<T>) {
  const [shrink, setShrink] = useState(false);

  const handleSelect = (value: T | null, e: any) => {
    onChange(value, e);
  };

  return (
    <PopperSelect
      getOptionLabel={getOptionLabel}
      onChange={handleSelect}
      getOptionValue={(option) => getOptionLabel(option)}
      onClose={() => setShrink(false)}
      selected={value ? [value] : []}
      options={options}
      onClean={(e) => {
        onChange(null, e);
      }}
    >
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
    </PopperSelect>
  );
}
