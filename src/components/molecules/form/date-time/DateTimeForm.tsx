/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box, BoxProps } from '@mui/material';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { getTimeList } from 'core/utils/helpers/times';
import { timeMask } from 'core/utils/masks/date.mask';

export function DateTimeForm(
  props: Omit<AutocompleteFormProps<string>, 'options'> & {
    boxProps?: BoxProps;
    get15TimeArray?: [number, number, number, number];
  },
) {
  return (
    <Box maxWidth={props?.boxProps?.maxWidth ?? 120} {...props?.boxProps}>
      <AutocompleteForm
        filterOptions={(x) => x}
        unmountOnChangeDefault
        freeSolo
        getOptionLabel={(option) => String(option)}
        inputProps={{
          labelPosition: 'top',
          placeholder: '00:00',
          name: props.name,
        }}
        mask={timeMask.apply}
        sx={{ width: [120] }}
        options={getTimeList(...(props?.get15TimeArray || [0, 0, 23, 59]))}
        // label="Hora"
        // setValue={(v) => props?.setValue('startTime', v)}
        // defaultValue={props.defaultValue}
        // control={props.control}
        {...props}
      />
    </Box>
  );
}
