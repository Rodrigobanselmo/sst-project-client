import React, { FC, memo } from 'react';

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
    clearOnBlur={clearOnBlur}
    renderInput={(params) => (
      <SInput
        labelPosition="center"
        {...params}
        {...inputProps}
        size="small"
        label={label}
      />
    )}
    {...props}
  />
);

export default memo(SAutocompleteSelect);
