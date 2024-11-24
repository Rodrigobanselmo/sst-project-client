import {
  Autocomplete,
  Box,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { SInput } from '../SInput/SInput';
import { SAutocompleteFreeSoloProps } from './SAutocompleteFreeSolo.types';
import { stringTransformations } from '@v2/utils/string-transformation';

export function SAutocompleteFreeSolo<
  T,
  M extends boolean | undefined,
  D extends boolean | undefined,
  F extends boolean | undefined,
>({
  inputProps,
  errorMessage,
  label,
  options,
  loading,
  placeholder,
  onChange,
  value,
  boxProps,
  transformation,
  ...props
}: SAutocompleteFreeSoloProps<T, M, D, F>) {
  const currentValue = transformation
    ? stringTransformations(String(value || ''), transformation)
    : value;

  return (
    <Box
      {...boxProps}
      sx={{
        flex: 1,
        minWidth: 100,
        ...boxProps?.sx,
      }}
    >
      <Autocomplete
        onChange={(e, v) => onChange(v, e)}
        value={currentValue}
        inputValue={currentValue as string}
        noOptionsText="Sem opções"
        options={options}
        loading={loading}
        clearIcon={false}
        freeSolo
        ListboxProps={{
          sx: {
            '& li': {
              borderBottom: '1px solid #e0e0e0',
            },
            '& li:last-child': {
              borderBottom: 'none',
            },
          },
        }}
        onInputChange={(e, newInputValue) => {
          const transformedValue = transformation
            ? stringTransformations(newInputValue, transformation)
            : newInputValue;
          onChange(transformedValue, e); // Ensure inputValue is updated with the transformation
        }}
        renderInput={(params) => (
          <SInput
            textFieldProps={params}
            {...inputProps}
            value={currentValue}
            error={!!errorMessage}
            helperText={errorMessage}
            placeholder={placeholder || 'Digite para pesquisar'}
            label={label || 'Pesquisar'}
            inputProps={{
              ...params.InputProps,
              ...inputProps?.inputProps,
              value: currentValue,
              endAdornment: (
                <>
                  {inputProps?.endAdornment}
                  {loading && (
                    <InputAdornment position="end">
                      <CircularProgress color="inherit" size={20} />
                    </InputAdornment>
                  )}
                </>
              ),
            }}
            fullWidth={true}
            sx={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              ...inputProps?.sx,
              p: 0,
            }}
          />
        )}
        sx={{
          '& .MuiOutlinedInput-root': {
            paddingRight: '16px !important',
          },
        }}
        {...props}
      />
    </Box>
  );
}

/*
<SAutocompleteFreeSolo
  label="Estado"
  value={value}
  getOptionLabel={(option) => option.label}
  onChange={(_, option) => {
    console.log(option);
    setValue(option);
  }}
  onInputChange={(e, value, reason) => console.log(value, reason)}
  placeholder="Estado (UF)"
  options={[{ label: '1' }, { label: '2' }, { label: '3' }]}
/>
*/
