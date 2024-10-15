import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, InputAdornment } from '@mui/material';
import Select from '@mui/material/Select';
import * as React from 'react';
import { SSelectProps } from './SSelect';
import { SelectMenuItem } from './components/MenuItem/SelectMenuItem';
import { SelectFormControl } from './components/SelectFormControl/SelectFormControl';
import SChip from '@v2/components/atoms/SChip/SChip';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { SText } from '@v2/components/atoms/SText/SText';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';

export interface SSelectMultipleProps<T>
  extends Omit<SSelectProps<T>, 'value' | 'onChange'> {
  value?: T[];
  onChange?: (value: T[]) => void;
}

// <SSelectMultiple
//   label="selecione"
//   getOptionLabel={(option) => option.label}
//   getOptionValue={(option) => option.value}
//   onChange={(value) => setValueMultSelect(value)}
//   options={[
//     { label: 'Rodrigo', value: 1 },
//     { label: 'Barbosa', value: 2 },
//     { label: 'Anselmo', value: 3 },
//   ]}
//   value={valueSelectMult}
// />;

export function SSelectMultiple<T>({
  value,
  labelShrink,
  label,
  onChange,
  getOptionLabel,
  getOptionValue,
  size = 'sm',
  options,
  ...props
}: SSelectMultipleProps<T>) {
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
      validValue={!!value?.length}
      errorMessage={props.errorMessage}
    >
      <Select
        {...props}
        multiple
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
          const values = options?.filter((option) =>
            (e.target.value as any).find((v) => v == getOptionValue(option)),
          );
          onChange?.(values || []);
        }}
        value={value?.map((v) => getOptionValue(v)) as any}
        label={getLabel()}
        labelId="simple-select-label"
        size="small"
        MenuProps={{ sx: { maxHeight: 300 } }}
        endAdornment={
          <InputAdornment
            className="close-icon"
            position="end"
            sx={{ cursor: 'pointer ', mr: 8 }}
            onClick={() => {
              setIsShrink(false);
              onChange?.([]);
            }}
          >
            <IconButton sx={{ width: 25, height: 25 }}>
              <CloseIcon sx={{ color: 'text.light', fontSize: 20 }} />
            </IconButton>
          </InputAdornment>
        }
        renderValue={() => {
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, my: 3 }}>
              {value?.map((option) => (
                <SFlex
                  center
                  key={getOptionValue(option)}
                  py={1}
                  px={4}
                  border="1px solid"
                  borderColor={'primary.main'}
                  borderRadius={'4px'}
                >
                  <SText color="primary.main" fontSize={12}>
                    {getOptionLabel(option) || ''}
                  </SText>
                  <IconButton
                    sx={{ height: 16, width: 16 }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onChange?.(
                        value?.filter(
                          (v) => getOptionValue(v) !== getOptionValue(option),
                        ) || [],
                      );
                    }}
                  >
                    <CancelOutlinedIcon
                      sx={{ fontSize: 16, color: 'primary.main' }}
                    />
                  </IconButton>
                </SFlex>
              ))}
            </Box>
          );
        }}
      >
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
