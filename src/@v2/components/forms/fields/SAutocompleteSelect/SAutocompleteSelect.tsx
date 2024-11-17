import {
  Autocomplete,
  CircularProgress,
  Divider,
  InputAdornment,
  ListItem,
} from '@mui/material';
import { SInput } from '../SInput/SInput';
import { SAutocompleteSelectProps } from './SAutocompleteSelect.types';

export function SAutocompleteSelect<
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
  onInputChange,
  onChange,
  value,
  getOptionLabel,
  ...props
}: SAutocompleteSelectProps<T, M, D, F>) {
  //   <SAutocompleteSelect
  //   label="Estado"
  //   value={value}
  //   getOptionLabel={(option) => option.label}
  //   onChange={(_, option) => {
  //     console.log(option);
  //     setValue(option);
  //   }}
  //   onInputChange={(e, value, reason) => console.log(value, reason)}
  //   placeholder="Estado (UF)"
  //   options={[{ label: '1' }, { label: '2' }, { label: '3' }]}
  // />
  return (
    <Autocomplete
      onChange={onChange}
      getOptionLabel={getOptionLabel}
      value={value}
      noOptionsText="Sem opções"
      options={options}
      loading={loading}
      ListboxProps={{
        sx: {
          p: 0,
          '& li': {
            borderBottom: '1px solid #e0e0e0',
          },
          '& li:last-child': {
            borderBottom: 'none',
          },
        },
      }}
      onInputChange={onInputChange}
      renderInput={(params) => (
        <SInput
          textFieldProps={params}
          {...inputProps}
          error={!!errorMessage}
          helperText={errorMessage}
          placeholder={placeholder || 'Digite para pesquisar'}
          label={label || 'Pesquisar'}
          inputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
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
          }}
        />
      )}
      {...props}
    />
  );
}
