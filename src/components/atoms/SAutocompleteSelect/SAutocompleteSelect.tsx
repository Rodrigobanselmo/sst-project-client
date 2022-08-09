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
  clearOnBlur,
  ...props
}) => (
  <StyledAutocompleteSelect
    options={options}
    popupIcon={<StyledAutocompleteIcon />}
    noOptionsText={!clearOnBlur ? '' : 'Nenhuma opção'}
    renderInput={(params) => (
      <SInput
        labelPosition="center"
        {...params}
        {...inputProps}
        size="small"
        label={label}
        onChange={(e) => intMask.apply(e.target.value)}
      />
    )}
    {...props}
  />
);

export default memo(SAutocompleteSelect);
