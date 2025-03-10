import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Box, BoxProps, IconButton, MenuItemProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import * as React from 'react';
import { SInput } from '../SInput/SInput';
import { SInputProps } from '../SInput/SInput.types';
import { InputEndAdormentSelect } from './components/InputEndAdormentSelect/InputEndAdormentSelect';
import { PopperSelect } from './components/PopperSelect/PopperSelect';

export interface SSearchSelectMultipleProps<Value> {
  options: Value[];
  value: Value[];
  inputProps?: Partial<SInputProps>;
  errorMessage?: string;
  label?: string;
  loading?: boolean;
  placeholder?: string;
  getOptionLabel: (option: Value) => string;
  getOptionValue: (option: Value) => string | number | boolean;
  onChange: (value: Value[], event: React.SyntheticEvent) => void;
  onScrollEnd?: () => void;
  onInputChange?: (value: string, event: React.SyntheticEvent) => void;
  boxProps?: BoxProps;
  renderFullOption?: (args: {
    option: Value;
    label: string;
    isSelected: boolean;
    handleSelect: (e: any) => void;
  }) => React.ReactNode;
  onSearch?: (value: string) => void;
  popperStartCompoent?: React.ReactNode;
  popperItemProps?: MenuItemProps;
  renderItem?: (args: {
    option: Value;
    label: string;
    isSelected: boolean;
  }) => React.ReactNode;
}

export function SSearchSelectMultiple<T>({
  inputProps,
  errorMessage,
  label,
  options,
  loading,
  placeholder,
  value: values,
  boxProps,
  onInputChange,
  onChange,
  getOptionValue,
  getOptionLabel,
  onSearch,
  renderItem,
  renderFullOption,
  popperItemProps,
  popperStartCompoent,
  onScrollEnd,
}: SSearchSelectMultipleProps<T>) {
  const [shrink, setShrink] = React.useState(false);
  console.log({ values });

  const handleSelect = (value: T, e: any) => {
    const index = values?.findIndex(
      (v) => getOptionValue(v) == getOptionValue(value),
    );

    let newValue = values;

    if (index !== -1) {
      newValue = values?.filter((_, i) => i !== index);
    } else {
      newValue = [...(values || []), value];
    }

    onChange(newValue, e);
  };

  return (
    <Box {...boxProps}>
      <PopperSelect
        startCompoent={popperStartCompoent}
        renderItem={renderItem}
        onScrollEnd={onScrollEnd}
        loading={loading}
        renderFullOption={renderFullOption}
        onSearchFunc={onSearch}
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        selected={values}
        closeOnSelect={false}
        onClose={() => setShrink(false)}
        onChange={handleSelect}
        options={options}
        popperItemProps={popperItemProps}
        onClean={(e) => {
          onChange([], e);
        }}
      >
        <Box
          position="relative"
          sx={{
            input: { flex: 1 },
            '& .MuiInputBase-adornedStart': { width: '100%' },
          }}
        >
          <SInput
            fullWidth
            {...inputProps}
            shrink={shrink || !!values?.length}
            error={!!errorMessage}
            onFocus={() => setShrink(true)}
            onChange={(e) => {
              onInputChange?.(e.target.value, e);
            }}
            value={''}
            helperText={errorMessage}
            placeholder={values?.length ? '' : placeholder}
            label={label}
            endAdornment={
              <InputEndAdormentSelect
                loading={loading}
                onClear={(e) => {
                  e.stopPropagation();
                  onInputChange?.('', e);
                  onChange([], e);
                }}
              />
            }
            startAdornment={
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, my: 3 }}>
                {values?.map((option) => (
                  <SFlex
                    center
                    key={getOptionLabel(option)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleSelect(option, e);
                      }}
                    >
                      <CancelOutlinedIcon
                        sx={{ fontSize: 16, color: 'primary.main' }}
                      />
                    </IconButton>
                  </SFlex>
                ))}
              </Box>
            }
            sx={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              ...inputProps?.sx,
            }}
          />
        </Box>
      </PopperSelect>
    </Box>
  );
}

{
  /* <SSearchSelectMultiple
label="Estado"
value={values}
popperStartCompoent={
      <PopperSidebar
        loading={isLoadingTypes}
        active={active}
        setActive={setActive}
        options={types}
        getOptionLabel={(type) => hierarchyTypeTranslation[type]}
      />
    }
getOptionLabel={(option) => option.label}
getOptionValue={(option) => option.label}
onChange={(option) => {
  setValues(option);
}}
onInputChange={(value) => console.log(value)}
placeholder="Estado (UF)"
options={[
  { label: 'Rodrigo Rodrigo Rodrigo Rodrigo Rodrigo Rodrigo' },
  { label: 'Anselmo Anselmo Anselmo' },
  { label: 'Barbosa Rodrigo Rodrigo Anselmo' },
  { label: 'Barbosa Rodrigo Anselmo' },
  { label: 'Barbosa Anselmo' },
  { label: 'Anselmo' },
]}
/> */
}
