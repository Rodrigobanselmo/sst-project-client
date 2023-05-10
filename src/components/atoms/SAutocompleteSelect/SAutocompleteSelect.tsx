import React, { FC, memo } from 'react';

import { cpfMask } from 'core/utils/masks/cpf.mask';
import { intMask } from 'core/utils/masks/int.mask';

import { SInput } from '../SInput';
import {
  StyledAutocompleteIcon,
  StyledAutocompleteSelect,
} from './SAutocompleteSelect.styles';
import { AutocompleteSelectProps } from './SAutocompleteSelect.types';

const SAutocompleteSelect: FC<AutocompleteSelectProps> = ({
  label,
  options,
  inputProps,
  freeSolo,
  ...props
}) => (
  <StyledAutocompleteSelect
    options={options}
    popupIcon={<StyledAutocompleteIcon />}
    noOptionsText={'Nenhuma opção'}
    freeSolo={freeSolo}
    renderInput={(params) => (
      <SInput
        labelPosition="center"
        {...params}
        {...inputProps}
        sx={{
          ...(!freeSolo && {
            '.MuiInputBase-input': {
              mr: '50px',
            },
          }),
          ...(freeSolo && {
            '.MuiInputBase-input': {
              mr: '25px',
            },
          }),
          ...inputProps?.sx,
        }}
        size="small"
        label={label}
        onChange={(e) => intMask.apply(e.target.value)}
      />
    )}
    {...props}
  />
);

export default memo(SAutocompleteSelect);
