import CloseIcon from '@mui/icons-material/Close';
import { IconButton, InputAdornment } from '@mui/material';
import Select, { SelectProps } from '@mui/material/Select';
import * as React from 'react';
import { SelectMenuItem } from './components/MenuItem/SelectMenuItem';
import { SelectFormControl } from './components/SelectFormControl/SelectFormControl';

export interface SSelectProps<T>
  extends Pick<SelectProps, 'onFocus' | 'onBlur'> {
  options?: T[];
  value?: T | null;
  size?: 'sm' | 'md';
  onChange?: (value: T | null) => void;
  getOptionLabel: (option: T) => string | undefined;
  getOptionValue: (option: T) => string | number;
  nullOptionText?: string;
  disabledNullOption?: boolean;
  errorMessage?: string;
  label?: string;
  labelShrink?: string;
  placeholder?: string;
  error?: any;
}

//! tem que ver pq não ta funcionando
export function SSelect<T>({
  value,
  labelShrink,
  label,
  onChange,
  getOptionLabel,
  getOptionValue,
  size = 'sm',
  options,
  ...props
}: SSelectProps<T>) {
  const [isShrink, setIsShrink] = React.useState(false);

  const getLabel = () => {
    if (isShrink && !value) {
      return labelShrink ?? label;
    } else {
      return label ?? labelShrink;
    }
  };

  return (
    <SelectFormControl
      isShrink={isShrink}
      label={getLabel()}
      size={size}
      validValue={!!value}
      errorMessage={props.errorMessage}
    >
      <Select
        {...props}
        onFocus={(e) => {
          setIsShrink(true);
          props?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsShrink(false);
          props?.onBlur?.(e);
        }}
        onChange={(e) => {
          setIsShrink(true);
          const value = options?.find(
            (option) => getOptionValue(option) == e.target.value,
          );

          onChange?.(value || null);
        }}
        value={value ? getOptionLabel(value) : null}
        label={getLabel()}
        labelId="simple-select-label"
        size="small"
        endAdornment={
          <InputAdornment
            className="close-icon"
            position="end"
            sx={{ cursor: 'pointer ', mr: 8 }}
            onClick={() => {
              setIsShrink(false);
              onChange?.(null);
            }}
          >
            <IconButton sx={{ width: 25, height: 25 }}>
              <CloseIcon sx={{ color: 'text.light', fontSize: 20 }} />
            </IconButton>
          </InputAdornment>
        }
        MenuProps={{
          sx: { maxHeight: 300 },
        }}
      >
        {!props.disabledNullOption && (
          <SelectMenuItem component={'li'} value="">
            {props.nullOptionText ?? '-'}
          </SelectMenuItem>
        )}
        {options?.map((option) => (
          <SelectMenuItem
            component={'li'}
            value={getOptionValue(option)}
            key={getOptionValue(option)}
          >
            {getOptionLabel(option)}
          </SelectMenuItem>
        ))}
      </Select>
    </SelectFormControl>
  );
}

// <SSelect
// label="selecione"
// getOptionLabel={(option) => option.label}
// getOptionValue={(option) => option?.label}
// onChange={(value) => setValueSelect(value)}
// options={[
//   { label: 'Rodrigo', value: 1 },
//   { label: 'Barbosa', value: 2 },
//   { label: 'Anselmo', value: 3 },
// ]}
// value={valueSelect}
// />
